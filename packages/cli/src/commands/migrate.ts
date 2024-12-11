import {
  composeCodemods,
  createCodemodTask,
  loadUserConfig,
} from '@ag-grid-devtools/codemod-task-utils';
import {
  Codemod,
  CodemodTaskInput,
  CodemodTaskWorkerResult,
  TaskRunnerEnvironment,
  type VersionManifest,
} from '@ag-grid-devtools/types';
import { checkbox, Separator } from '@inquirer/prompts';
import codemods from '../codemods/lib';

import { nonNull } from '@ag-grid-devtools/utils';
import { createFsHelpers } from '@ag-grid-devtools/worker-utils';
import { createTwoFilesPatch } from 'diff';
import { cpus } from 'node:os';
import { dirname, join, resolve as pathResolve } from 'node:path';
import semver from 'semver';

import { dynamicRequire } from '@ag-grid-devtools/utils';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type CliEnv, type CliOptions } from '../types/cli';
import { type WritableStream } from '../types/io';
import { CliArgsError, CliError } from '../utils/cli';
import { findGitRoot, findSourceFiles } from '../utils/fs';
import { findInGitRepository, getUncommittedGitFiles } from '../utils/git';
import { getCliCommand, getCliPackageVersion } from '../utils/pkg';
import { green, indentErrorMessage, log } from '../utils/stdio';
import { Worker, WorkerTaskQueue, type WorkerOptions } from '../utils/worker';

const { versions } = codemods;

const SOURCE_FILE_EXTENSIONS = ['.cjs', '.js', '.mjs', '.jsx', '.ts', '.tsx', '.vue'];
const LATEST_VERSION = versions[versions.length - 1].version;
const DEFAULT_TARGET_VERSION = getMinorSemverVersion(getCliPackageVersion()) ?? LATEST_VERSION;

const thisFolder = pathResolve(
  (typeof __dirname !== 'undefined' ? __dirname : '.') ||
    (import.meta.url && dirname(fileURLToPath(import.meta.url))) ||
    './',
);
const CODEMODS_FOLDER = dirname(
  dynamicRequire.tryResolveOneOf(
    [pathResolve(thisFolder, 'codemods/lib'), pathResolve(thisFolder, '../codemods/lib')],
    import.meta,
  ),
);
const WORKER_PATH = `${CODEMODS_FOLDER}/worker`;

export interface MigrateCommandArgs {
  /**
   * Semver version to migrate from
   */
  from: VersionManifest['version'] | null;
  /**
   * Semver version to migrate to
   */
  to: VersionManifest['version'];
  /**
   * Allow operating on files outside a git repository
   */
  allowUntracked: boolean;
  /**
   * Allow operating on repositories with uncommitted changes in the working tree
   */
  allowDirty: boolean;
  /**
   * Number of worker threads to spawn (defaults to the number of system cores)
   */
  numThreads: number | undefined;
  /**
   * Show a diff output of the changes that would be made
   */
  dryRun: boolean;
  /**
   * Show additional log output
   */
  verbose: boolean;
  /**
   * Show usage instructions
   */
  help: boolean;
  /**
   * List of input files to operate on (defaults to all source files in the current working directory)
   */
  input: Array<string>;
  /**
   * The path of the user config to load
   */
  userConfigPath?: string;
  /**
   * Hint about which AG Chart features / package is required.
   */
  usingCharts?: 'community' | 'enterprise' | 'none';
}

function usage(env: CliEnv): string {
  return `Usage: ${getCliCommand()} migrate [options] [<file>...]

Upgrade project source files to ensure compatibility with a specific AG Grid version
See https://ag-grid.com/javascript-data-grid/codemods for more information

Options:
  Required arguments:
    --from=<version>          AG Grid semver version to migrate from

  Optional arguments:
    --to=<version>            AG Grid semver version to migrate to (defaults to ${green(
      DEFAULT_TARGET_VERSION,
      env,
    )})
    --allow-untracked, -u     Allow operating on files outside a git repository
    --allow-dirty, -d         Allow operating on repositories with uncommitted changes in the working tree
    --num-threads             Number of worker threads to spawn (defaults to the number of system cores)
    --dry-run                 Show a diff output of the changes that would be made
    --config=<file.cjs>       Loads a .cjs or .cts configuration file to customize the codemod behavior.
                              See https://ag-grid.com/javascript-data-grid/codemods/#configuration-file

  Version Specific Options:
  --using-charts=<value>      v33 Which AG Charts bundle to used if it cannot be inferred automatically. One of: ['community' | 'enterprise' | 'none']

  Additional arguments:
    [<file>...<dir>...]       List of input files and directories to operate on.
                              Defaults to all source files in the current working directory excluding patterns in .gitignore

  Other options:
    --verbose, -v             Show additional log output
    --help, -h                Show usage instructions
`;
}

export function parseArgs(args: string[], env: CliEnv): MigrateCommandArgs {
  const options: MigrateCommandArgs = {
    from: null,
    to: DEFAULT_TARGET_VERSION,
    allowUntracked: false,
    allowDirty: false,
    numThreads: undefined,
    dryRun: false,
    verbose: false,
    help: false,
    input: [],
    userConfigPath: undefined,
    usingCharts: 'community',
  };
  let arg;
  while ((arg = args.shift())) {
    if (arg.includes('=')) {
      const [firstArg] = arg.split('=', 1);
      args.unshift(arg.slice(firstArg.length + '='.length));
      arg = firstArg;
    }
    switch (arg) {
      case '--allow-untracked':
      case '-u':
        options.allowUntracked = true;
        break;
      case '--no-allow-untracked':
        options.allowUntracked = false;
        break;

      case '--allow-dirty':
      case '-d':
        options.allowDirty = true;
        break;
      case '--using-charts':
        {
          let value = args.shift();
          if (!value || value.startsWith('-')) {
            throw new CliArgsError(`Missing value for ${arg}`, usage(env));
          }
          const validValues = ['community', 'enterprise', 'none'];
          if (!validValues.includes(value)) {
            throw new CliArgsError(
              `Invalid value for ${arg}: ${value} (Pick one of: ${validValues.join()})`,
              usage(env),
            );
          }
          options.usingCharts = value as 'community' | 'enterprise' | 'none';
        }
        break;
      case '--no-allow-dirty':
        options.allowDirty = false;
        break;

      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-dry-run':
        options.dryRun = false;
        break;

      case '--verbose':
        options.verbose = true;
        break;
      case '--no-verbose':
        options.verbose = false;
        break;

      case '--from': {
        let value = args.shift();
        if (!value || value.startsWith('-')) {
          throw new CliArgsError(`Missing value for ${arg}`, usage(env));
        }
        value = semverCoerce(value);
        if (!semver.valid(value)) {
          throw new CliArgsError(
            `Invalid ${arg} migration starting version`,
            'Must be a valid semver version',
          );
        }
        options.from = value;
        break;
      }
      case '--to': {
        let value = args.shift();
        if (!value || value.startsWith('-')) {
          throw new CliArgsError(`Missing value for ${arg}`, usage(env));
        }
        if (value === 'latest') {
          value = LATEST_VERSION;
        } else {
          value = semverCoerce(value);
        }
        if (!versions.some(({ version }) => version === value)) {
          throw new CliArgsError(
            `Invalid ${arg} migration target version`,
            `Supported versions:\n\n${versions
              .map(({ version }) => version)
              .map(
                (version) =>
                  ` - ${green(version, env)}${
                    version === DEFAULT_TARGET_VERSION ? ' (default)' : ''
                  }`,
              )
              .join('\n')}\n`,
          );
        }
        options.to = value;
        break;
      }

      case '--num-threads': {
        const value = args.shift();
        if (!value || value.startsWith('-')) {
          throw new CliArgsError(`Missing value for ${arg}`, usage(env));
        }
        const numThreads = Number(value);
        if (isNaN(numThreads) || numThreads < 0) {
          throw new CliArgsError(`Invalid value for ${arg}: ${value}`, usage(env));
        }
        options.numThreads = numThreads;
        break;
      }
      case '--config': {
        let value = args.shift()?.trim();
        if (!value) {
          throw new CliArgsError(`Missing value for ${arg}`, usage(env));
        }
        if (value.startsWith('require:')) {
          value = value.slice('require:'.length);
          if (!value) {
            throw new CliArgsError(`Missing value for ${arg}`, usage(env));
          }
          options.userConfigPath = value;
        } else {
          options.userConfigPath = pathResolve(env.cwd ?? process.cwd(), value);
        }
        break;
      }

      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (arg.startsWith('-')) {
          throw new CliArgsError(`Unexpected argument: ${arg}`, usage(env));
        }
        options.input.push(arg);
        break;
    }
  }

  if (options.help) return options;
  if (!options.from) {
    throw new CliArgsError(`Missing --from migration starting version`, usage(env));
  }
  if (semver.gte(options.from, options.to)) {
    throw new CliArgsError(
      `Invalid --from migration starting version: ${green(options.from, env)}`,
      `Migration starting version must be less than target version (${green(options.to, env)})`,
    );
  }
  return options;
}

export async function cli(args: MigrateCommandArgs, options: CliOptions): Promise<void> {
  const { env, stdio } = options;
  const { stdout } = stdio;
  if (args.help) {
    return printUsage(stdout, env);
  }
  await migrate(args, options);
}

function printUsage(output: WritableStream, env: CliEnv): Promise<void> {
  return log(output, usage(env));
}

function semverCoerce(version: string): string {
  return semver.coerce(version)?.version ?? version;
}

async function migrate(
  args: Omit<MigrateCommandArgs, 'help'>,
  options: CliOptions,
): Promise<Array<string>> {
  const {
    from,
    to,
    allowUntracked,
    allowDirty,
    numThreads,
    dryRun,
    verbose,
    userConfigPath,
    input,
    usingCharts,
  } = args;
  let { cwd, env, stdio } = options;
  const { stdout, stderr } = stdio;

  cwd = resolve(cwd);

  const gitRoot = await findGitRoot(cwd);

  if (!allowUntracked && !gitRoot) {
    throw new CliError(
      'No git repository found',
      'To run this command outside a git repository, use the --allow-untracked option',
    );
  }

  const gitSourceFilePaths = gitRoot
    ? (await getGitSourceFiles(gitRoot)).map((path) => resolve(gitRoot, path))
    : null;

  let skipFiles = new Set<string>();
  if (userConfigPath) {
    skipFiles.add(userConfigPath);
  }

  if (usingCharts) {
    process.env.AG_USING_CHARTS = usingCharts;
  }

  const inputFilePaths = await findSourceFiles(
    cwd,
    input.length > 0 ? input : [cwd],
    SOURCE_FILE_EXTENSIONS,
    skipFiles,
    gitRoot,
  );

  if (!allowUntracked) {
    const trackedFilePaths = gitSourceFilePaths ? new Set(gitSourceFilePaths) : null;
    let untrackedInputFiles = trackedFilePaths
      ? inputFilePaths.filter((path) => !trackedFilePaths.has(path))
      : inputFilePaths;

    if (untrackedInputFiles.length > 0)
      throw new CliError(
        'Untracked input files',
        [
          'The following files are not tracked within the current git repository:',
          untrackedInputFiles.map((path) => ` ${relative(cwd, path)}`).join('\n'),
          'To operate on untracked files, use the --allow-untracked option',
        ].join('\n\n'),
      );
  }

  if (gitRoot && !allowDirty) {
    const inputFileSet = new Set(inputFilePaths);
    const uncommittedInputFiles = (await getUncommittedGitFiles(gitRoot))
      .map((path) => resolve(gitRoot, path))
      .filter((path) => inputFileSet.has(path));
    if (uncommittedInputFiles.length > 0) {
      throw new CliError(
        'Uncommitted changes',
        [
          'The following files within the current git repository have uncommitted changes:',
          uncommittedInputFiles.map((path) => ` ${relative(cwd, path)}`).join('\n'),
          'To operate on repositories containing uncommitted changes, use the --allow-dirty option',
        ].join('\n\n'),
      );
    }
  }

  const toVersion = versions.find(({ version }) => version === to);
  if (!toVersion) throw new CliError(`Unknown version: ${green(to, env)}`);

  const toSemver = semver.parse(toVersion.version);
  if (!toSemver) throw new CliError(`Invalid target semver version: ${green(to, env)}`);

  const fromSemver = from ? semver.parse(from) : null;
  if (!fromSemver) {
    throw new CliError(`Invalid starting semver version: ${green(from || 'null', env)}`);
  }

  const codemodVersions = versions.filter(({ version }) => {
    const versionSemver = semver.parse(version);
    if (!versionSemver) return false;
    return versionSemver.compare(fromSemver) > 0 && versionSemver.compare(toSemver) <= 0;
  });

  await log(
    stderr,
    `Migrating from version ${green(from || 'null', env)} to version ${green(to, env)}...`,
  );

  if (codemodVersions.length === 0) {
    throw new CliError(
      `Unable to migrate from version ${green(from || 'null', env)} to version ${green(to, env)}`,
      'There are no applicable migrations for the specified version range',
    );
  }

  log(
    stderr,
    [
      `Running ${codemodVersions.length} ${codemodVersions.length === 1 ? 'codemod' : 'codemods'}:`,
      ...codemodVersions.map(({ version }) => ` - ${green(version, env)}`),
    ].join('\n'),
  );

  // Declare task logging functions
  const onQueue = verbose
    ? (inputFilePath: string): void => {
        log(stderr, `Queueing ${relative(cwd, inputFilePath)}`);
      }
    : undefined;
  const onStart = (inputFilePath: string): void => {
    log(stderr, `Processing ${relative(cwd, inputFilePath)}`);
  };
  const onComplete = verbose
    ? (inputFilePath: string, stats: { runningTime: number }): void => {
        log(stderr, `Processed ${relative(cwd, inputFilePath)} in ${stats.runningTime}ms`);
      }
    : undefined;

  const startTime = Date.now();

  // Process the tasks either in-process or via a worker pool
  const isSingleThreaded = numThreads === 0;

  const answer = await checkbox({
    message: 'Select a package manager',
    choices: codemodVersions
      .flatMap((c) => c.transforms)
      .map((t) => {
        return { name: t.name, value: t, description: t.description };
      }),
  });

  console.log(
    { answer },
    codemodVersions.map((c) => c.codemodPath),
  );

  const codemodPaths = codemodVersions.map(({ codemodPath }) =>
    join(CODEMODS_FOLDER, codemodPath, 'codemod'),
  );

  const results = await (isSingleThreaded
    ? (() => {
        if (verbose) {
          log(stderr, 'Running in single-threaded mode');
        }
        // Load the codemod and wrap it in a task helper
        const codemod = composeCodemods(
          codemodPaths.map((codemodPath) =>
            dynamicRequire.requireDefault<Codemod>(codemodPath, import.meta),
          ),
        );
        return executeCodemodSingleThreaded(codemod, inputFilePaths, {
          dryRun,
          userConfigPath,
          onStart,
          onComplete,
        });
      })()
    : (() => {
        const numWorkers = numThreads || cpus().length;
        if (verbose) {
          log(stderr, `Running in multi-threaded mode with ${numWorkers} workers`);
        }

        // Create a worker pool to run the codemods in parallel
        let scriptPath: string | URL = dynamicRequire.resolve(WORKER_PATH, import.meta);

        // This will be true if we are trying to run from the codemod repo source code using tsx or vitest
        const isTsSourceCodeWorker = scriptPath.endsWith('.ts');

        const config: WorkerOptions = {
          // Pass the list of codemod paths to the worker via workerData
          workerData: {
            codemodPaths: isTsSourceCodeWorker
              ? codemodPaths.map((codemodPath) => dynamicRequire.resolve(codemodPath, import.meta))
              : codemodPaths,
            userConfigPath,
          },
          env: process.env,
          argv: [scriptPath],
          eval: isTsSourceCodeWorker,
        };

        const workerCodeOrPath = isTsSourceCodeWorker
          ? `try { require("tsx/cjs"); } catch (_) {} require(${JSON.stringify(scriptPath)});`
          : scriptPath;

        const workers = Array.from(
          { length: numWorkers },
          () => new Worker(workerCodeOrPath, config),
        );
        const workerPool = new WorkerTaskQueue<CodemodTaskInput, CodemodTaskWorkerResult>(workers);
        return executeCodemodMultiThreaded(workerPool, inputFilePaths, {
          dryRun,
          onQueue,
          onStart,
          onComplete,
        });
      })());

  const elapsedTime = Date.now() - startTime;

  const successResults = results
    .map((result) => (result.errors.length === 0 && result.warnings.length === 0 ? result : null))
    .filter(nonNull);
  const warningResults = results
    .map((result) => (result.warnings.length > 0 ? result : null))
    .filter(nonNull);
  const errorResults = results
    .map((result) => (result.errors.length > 0 ? result : null))
    .filter(nonNull);
  const changedResults = successResults.filter((result) => result.result.updated);
  const unchangedResults = successResults.filter((result) => !result.result.updated);

  // If this is a dry run, generate a unified diff of the changes
  if (dryRun) {
    const fileDiffs = successResults
      .map((result) => {
        const {
          path,
          result: { source, updated },
        } = result;
        if (!source || !updated) return null;
        const relativePath = relative(cwd, path);
        const from = { path: `a/${relativePath}`, source };
        const to = { path: `b/${relativePath}`, source: updated };
        return getUnifiedDiff(from, to);
      })
      .filter(nonNull);
    if (fileDiffs.length > 0) {
      const combinedDiff = fileDiffs.join('\n\n');
      await log(stdout, combinedDiff);
    }
  }

  await log(
    stderr,
    `Migration completed in ${elapsedTime}ms (${[
      `${changedResults.length} modified`,
      `${unchangedResults.length} unmodified`,
      `${warningResults.length} warnings`,
      `${errorResults.length} failed`,
      `${results.length} total`,
    ].join(', ')})`,
  );

  if (warningResults.length > 0) {
    await log(stderr, '');
    throw new CliError(
      `Encountered warnings in ${warningResults.length} ${
        warningResults.length === 1 ? 'file' : 'files'
      }`,
      formatFileErrors(
        warningResults.map(({ path, warnings: errors }) => ({
          path: relative(cwd, path),
          errors,
        })),
      ),
    );
  }

  if (errorResults.length > 0) {
    await log(stderr, '');
    throw new CliError(
      `Failed to process ${errorResults.length} ${errorResults.length === 1 ? 'file' : 'files'}`,
      formatFileErrors(
        errorResults.map(({ path, errors }) => ({
          path: relative(cwd, path),
          errors,
        })),
      ),
    );
  }

  return successResults.map(({ path }) => path);
}

type CodemodExecutionResult = Array<{
  path: string;
  result: { source: string | null; updated: string | null };
  errors: Array<Error>;
  warnings: Array<Error>;
}>;

function executeCodemodMultiThreaded(
  workerPool: WorkerTaskQueue<CodemodTaskInput, CodemodTaskWorkerResult>,
  inputFilePaths: string[],
  options: {
    dryRun: boolean;
    onQueue?: (inputFilePath: string) => void;
    onStart?: (inputFilePath: string) => void;
    onComplete?: (inputFilePath: string, stats: { runningTime: number }) => void;
  },
): Promise<CodemodExecutionResult> {
  const { dryRun, onQueue, onStart, onComplete } = options;
  // Process the tasks by dispatching them to the worker pool
  return Promise.all(
    inputFilePaths.map((inputFilePath) => {
      return workerPool
        .run(
          { inputFilePath, dryRun },
          {
            onQueue: onQueue?.bind(null, inputFilePath),
            onStart: onStart?.bind(null, inputFilePath),
            onComplete: onComplete?.bind(null, inputFilePath),
          },
        )
        .then((workerResult) => {
          if (workerResult.success) return workerResult.value;
          throw workerResult.error;
        })
        .then(({ result, errors, warnings }) => ({
          path: inputFilePath,
          result,
          errors,
          warnings,
        }))
        .catch((error: Error) => ({
          path: inputFilePath,
          result: { source: null, updated: null },
          errors: [error],
          warnings: new Array<Error>(),
        }));
    }),
  ).then((results) => {
    // Terminate the worker pool threads so that the main process can exit cleanly
    workerPool.terminate();
    return results;
  });
}

function executeCodemodSingleThreaded(
  codemod: Codemod,
  inputFilePaths: string[],
  options: {
    userConfigPath: string | undefined;
    dryRun: boolean;
    onStart?: (inputFilePath: string) => void;
    onComplete?: (inputFilePath: string, stats: { runningTime: number }) => void;
  },
): Promise<CodemodExecutionResult> {
  const { dryRun, onStart, onComplete, userConfigPath } = options;
  const userConfig = loadUserConfig(userConfigPath);
  const runner: TaskRunnerEnvironment = {
    fs: createFsHelpers(),
    userConfig,
  };
  const task = createCodemodTask(codemod, userConfig);
  // Run the codemod for each input file
  return Promise.all(
    inputFilePaths.map((inputFilePath) => {
      const startTime = Date.now();
      onStart?.(inputFilePath);
      return task
        .run({ inputFilePath, dryRun }, runner)
        .then(({ result, errors, warnings }) => ({
          path: inputFilePath,
          result,
          errors,
          warnings,
        }))
        .catch((error: Error) => ({
          path: inputFilePath,
          result: { source: null, updated: null },
          errors: [error],
          warnings: new Array<Error>(),
        }))
        .then((result) => {
          const runningTime = Date.now() - startTime;
          onComplete?.(inputFilePath, { runningTime });
          return result;
        });
    }),
  );
}

function formatFileErrors(warningResults: Array<{ path: string; errors: Error[] }>): string {
  return warningResults
    .map(
      ({ path, errors }) =>
        `${path}:\n\n${errors
          .map((error) => indentErrorMessage(error.message, { indent: '  ' }))
          .join('\n\n')}\n`,
    )
    .join('\n');
}

function getGitSourceFiles(projectRoot: string): Promise<Array<string>> {
  return findInGitRepository(
    SOURCE_FILE_EXTENSIONS.map((extension) => `*${extension}`),
    {
      gitRepository: projectRoot,
    },
  );
}

function getMinorSemverVersion(version: string): string | null {
  const parsed = semver.parse(version);
  if (!parsed) return null;
  return [parsed.major, parsed.minor, 0].join('.');
}

function getUnifiedDiff(
  from: { path: string; source: string },
  to: { path: string; source: string },
): string {
  return createTwoFilesPatch(from.path, to.path, from.source, to.source, undefined, undefined, {
    context: 3,
  });
}
