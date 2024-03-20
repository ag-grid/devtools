import codemods from '@ag-grid-devtools/codemods';
import { composeCodemods, createCodemodTask } from '@ag-grid-devtools/codemod-task-utils';
import {
  Codemod,
  CodemodTaskInput,
  CodemodTaskWorkerResult,
  type VersionManifest,
} from '@ag-grid-devtools/types';
import { createFsHelpers } from '@ag-grid-devtools/worker-utils';
import { nonNull } from '@ag-grid-devtools/utils';
import { createTwoFilesPatch } from 'diff';
import { join } from 'node:path';
import { cpus } from 'node:os';
import semver from 'semver';

import { type CliEnv, type CliOptions } from '../types/cli';
import { type WritableStream } from '../types/io';
import { CliArgsError, CliError } from '../utils/cli';
import { findInDirectory } from '../utils/fs';
import { findInGitRepository, getGitProjectRoot, getUncommittedGitFiles } from '../utils/git';
import { basename, extname, resolve, relative } from '../utils/path';
import { getCliCommand, getCliPackageVersion } from '../utils/pkg';
import { green, indentErrorMessage, log } from '../utils/stdio';
import { Worker, WorkerTaskQueue, type WorkerOptions } from '../utils/worker';
import { requireDynamicModule, resolveDynamicModule } from '../utils/module';

const { versions } = codemods;

const SOURCE_FILE_EXTENSIONS = ['.cjs', '.js', '.mjs', '.jsx', '.ts', '.tsx', '.vue'];
const LATEST_VERSION = versions[versions.length - 1].version;
const DEFAULT_TARGET_VERSION = getMinorSemverVersion(getCliPackageVersion()) ?? LATEST_VERSION;

const CODEMODS_PACKAGE = '@ag-grid-devtools/codemods';
const WORKER_PATH = `${CODEMODS_PACKAGE}/worker`;

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
   * Automatically apply fixes that potentially change application behavior
   */
  applyDangerousEdits: boolean;
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
}

function usage(env: CliEnv): string {
  return `Usage: ${getCliCommand()} migrate [options] [<file>...]

Upgrade project source files to ensure compatibility with a specific AG Grid version

Options:
  Optional arguments:
    --to=<version>            AG Grid semver version to migrate to (defaults to ${green(
      DEFAULT_TARGET_VERSION,
      env,
    )})
    --from=<version>          AG Grid semver version to migrate from (defaults to ${green(
      getPrecedingSemver(DEFAULT_TARGET_VERSION) ?? 'null',
      env,
    )})
    --allow-untracked, -u     Allow operating on files outside a git repository
    --allow-dirty, -d         Allow operating on repositories with uncommitted changes in the working tree
    --apply-dangerous-edits   Automatically apply fixes that potentially change application behavior
    --num-threads             Number of worker threads to spawn (defaults to the number of system cores)
    --dry-run                 Show a diff output of the changes that would be made

  Additional arguments:
    [<file>...]               List of input files to operate on (defaults to all source files in the current working directory)

  Other options:
    --verbose, -v             Show additional log output
    --help, -h                Show usage instructions
`;
}

export function parseArgs(args: string[], env: CliEnv): MigrateCommandArgs {
  const options: MigrateCommandArgs = {
    from: getPrecedingSemver(DEFAULT_TARGET_VERSION),
    to: DEFAULT_TARGET_VERSION,
    allowUntracked: false,
    allowDirty: false,
    applyDangerousEdits: false,
    numThreads: undefined,
    dryRun: false,
    verbose: false,
    help: false,
    input: [],
  };
  let arg;
  while ((arg = args.shift())) {
    if (arg.includes('=')) {
      const [firstArg] = arg.split('=', 1);
      args.unshift(arg.slice(firstArg.length + '='.length));
      arg = firstArg;
    }
    switch (arg) {
      case '--from': {
        const value = args.shift();
        if (!value || value.startsWith('-')) {
          throw new CliArgsError(`Missing value for ${arg}`, usage(env));
        }
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
        const value = args.shift();
        if (!value || value.startsWith('-')) {
          throw new CliArgsError(`Missing value for ${arg}`, usage(env));
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
      case '--allow-untracked':
      case '-u':
        options.allowUntracked = true;
        break;
      case '--allow-dirty':
      case '-d':
        options.allowDirty = true;
        break;
      case '--allow-dangerous-edits':
        options.applyDangerousEdits = true;
        break;
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
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
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
  if (options.from && semver.gte(options.from, options.to)) {
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

async function migrate(
  args: Omit<MigrateCommandArgs, 'help'>,
  options: CliOptions,
): Promise<Array<string>> {
  const {
    from,
    to,
    allowUntracked,
    allowDirty,
    applyDangerousEdits,
    numThreads,
    dryRun,
    verbose,
    input,
  } = args;
  const { cwd, env, stdio } = options;
  const { stdout, stderr } = stdio;

  const gitProjectRoot = await getGitProjectRoot(cwd);

  if (!allowUntracked && !gitProjectRoot) {
    throw new CliError(
      'No git repository found',
      'To run this command outside a git repository, use the --allow-untracked option',
    );
  }

  const gitSourceFilePaths = gitProjectRoot
    ? (await getGitSourceFiles(gitProjectRoot)).map((path) => resolve(gitProjectRoot, path))
    : null;

  const inputFilePaths =
    input.length > 0
      ? input.map((path) => resolve(cwd, path))
      : (await getProjectSourceFiles(cwd)).map((path) => resolve(cwd, path));

  if (!allowUntracked) {
    const trackedFilePaths = gitSourceFilePaths ? new Set(gitSourceFilePaths) : null;
    const untrackedInputFiles = trackedFilePaths
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

  if (gitProjectRoot && !allowDirty) {
    const inputFileSet = new Set(inputFilePaths);
    const uncommittedInputFiles = (await getUncommittedGitFiles(gitProjectRoot))
      .map((path) => resolve(gitProjectRoot, path))
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
  if (from && !fromSemver) throw new CliError(`Invalid starting semver version: ${green(to, env)}`);

  const codemodVersions = fromSemver
    ? versions.filter(({ version }) => {
        const versionSemver = semver.parse(version);
        if (!versionSemver) return false;
        return versionSemver.compare(fromSemver) > 0 && versionSemver.compare(toSemver) <= 0;
      })
    : [toVersion];
  await log(
    stderr,
    `Migrating${from ? ` from version ${green(from, env)}` : ''} to version ${green(to, env)}...`,
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

  const codemodPaths = codemodVersions.map(({ codemodPath }) =>
    join(CODEMODS_PACKAGE, codemodPath),
  );

  const results = await (isSingleThreaded
    ? (() => {
        if (verbose) {
          log(stderr, 'Running in single-threaded mode');
        }
        // Load the codemod and wrap it in a task helper
        const codemod = composeCodemods(
          codemodPaths.map((codemodPath) =>
            requireDynamicModule<Codemod>(codemodPath, import.meta),
          ),
        );
        return executeCodemodSingleThreaded(codemod, inputFilePaths, {
          dryRun,
          applyDangerousEdits,
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
        const scriptPath = resolveDynamicModule(WORKER_PATH, import.meta);
        const config: WorkerOptions = {
          // Pass the list of codemod paths to the worker via workerData
          workerData: codemodPaths,
        };
        const workers = Array.from({ length: numWorkers }, () => new Worker(scriptPath, config));
        const workerPool = new WorkerTaskQueue<CodemodTaskInput, CodemodTaskWorkerResult>(workers);
        return executeCodemodMultiThreaded(workerPool, inputFilePaths, {
          dryRun,
          applyDangerousEdits,
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
    applyDangerousEdits: boolean;
    onQueue?: (inputFilePath: string) => void;
    onStart?: (inputFilePath: string) => void;
    onComplete?: (inputFilePath: string, stats: { runningTime: number }) => void;
  },
): Promise<CodemodExecutionResult> {
  const { dryRun, applyDangerousEdits, onQueue, onStart, onComplete } = options;
  // Process the tasks by dispatching them to the worker pool
  return Promise.all(
    inputFilePaths.map((inputFilePath) => {
      return workerPool
        .run(
          { inputFilePath, dryRun, applyDangerousEdits },
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
    dryRun: boolean;
    applyDangerousEdits: boolean;
    onStart?: (inputFilePath: string) => void;
    onComplete?: (inputFilePath: string, stats: { runningTime: number }) => void;
  },
): Promise<CodemodExecutionResult> {
  const { dryRun, applyDangerousEdits, onStart, onComplete } = options;
  const task = createCodemodTask(codemod);
  const runner = { fs: createFsHelpers() };
  // Run the codemod for each input file
  return Promise.all(
    inputFilePaths.map((inputFilePath) => {
      const startTime = Date.now();
      onStart?.(inputFilePath);
      return task
        .run({ inputFilePath, dryRun, applyDangerousEdits }, runner)
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

function getProjectSourceFiles(projectRoot: string): Promise<Array<string>> {
  return findInDirectory(
    projectRoot,
    (filePath, stats) =>
      (stats.isDirectory() && basename(filePath) !== 'node_modules') ||
      (stats.isFile() && isSourceFile(filePath)),
  );
}

function getGitSourceFiles(projectRoot: string): Promise<Array<string>> {
  return findInGitRepository(
    SOURCE_FILE_EXTENSIONS.map((extension) => `*${extension}`),
    {
      gitRepository: projectRoot,
    },
  );
}

function isSourceFile(filePath: string): boolean {
  return SOURCE_FILE_EXTENSIONS.includes(extname(filePath));
}

function getMinorSemverVersion(version: string): string | null {
  const parsed = semver.parse(version);
  if (!parsed) return null;
  return [parsed.major, parsed.minor, 0].join('.');
}

function getPrecedingSemver(version: string): string | null {
  const parsed = semver.parse(version);
  if (!parsed) return null;
  const isPatchRelease = parsed.patch > 0;
  const isMinorRelease = !isPatchRelease && parsed.minor > 0;
  const isMajorRelease = !isMinorRelease && parsed.major > 0;
  if (isPatchRelease || isMinorRelease) return [parsed.major, 0, 0].join('.');
  if (isMajorRelease) return [parsed.major - 1, 0, 0].join('.');
  return null;
}

function getUnifiedDiff(
  from: { path: string; source: string },
  to: { path: string; source: string },
): string {
  return createTwoFilesPatch(from.path, to.path, from.source, to.source, undefined, undefined, {
    context: 3,
  });
}
