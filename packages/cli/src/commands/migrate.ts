import codemods from '@ag-grid-community/codemods';
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
import { getCliCommand } from '../utils/pkg';
import { green, indentErrorMessage, log } from '../utils/stdio';
import { Worker, WorkerTaskQueue } from '../utils/worker';
import { requireDynamicModule, resolveDynamicModule } from '../utils/module';
import { createCodemodTask } from '../../../codemod-utils/src/taskHelpers';

const { versions } = codemods;

const SOURCE_FILE_EXTENSIONS = ['.cjs', '.js', '.mjs', '.jsx', '.ts', '.tsx', '.vue'];
const LATEST_VERSION = versions[versions.length - 1].version;

export interface MigrateCommandArgs {
  /**
   * Semver version to migrate from
   */
  from: VersionManifest['version'];
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
      LATEST_VERSION,
      env,
    )})
    --from=<version>          AG Grid semver version to migrate from
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
    from: '',
    to: LATEST_VERSION,
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
                  ` - ${green(version, env)}${version === LATEST_VERSION ? ' (default)' : ''}`,
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

  const version = versions.find(({ version }) => version === to);
  if (!version) throw new CliError(`Unknown version: ${green(to, env)}`);

  await log(
    stderr,
    `Migrating${from ? ` from version ${green(from, env)}` : ''} to version ${green(to, env)}...`,
  );

  const startTime = Date.now();

  // Process the tasks either in-process or via a worker pool
  const isSingleThreaded = numThreads === 0;
  const results = await (isSingleThreaded
    ? (() => {
        // Load the codemod and wrap it in a task helper
        const codemod = requireDynamicModule(
          join('@ag-grid-community/codemods', version.codemodPath),
          import.meta,
        ) as Codemod;
        const task = createCodemodTask(codemod);
        const runner = { fs: createFsHelpers() };
        if (verbose) {
          log(stderr, 'Running in single-threaded mode');
        }
        // Run the codemod for each input file
        return Promise.all(
          inputFilePaths.map((inputFilePath) => {
            const startTime = Date.now();
            log(stderr, `Processing ${relative(cwd, inputFilePath)}`);
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
                if (verbose) {
                  const runningTime = Date.now() - startTime;
                  log(stderr, `Processed ${relative(cwd, inputFilePath)} in ${runningTime}ms`);
                }
                return result;
              });
          }),
        );
      })()
    : (() => {
        // Create a worker pool to run the codemods in parallel
        const workerPath = resolveDynamicModule(
          join('@ag-grid-community/codemods', version.workerPath),
          import.meta,
        );
        const numWorkers = numThreads || cpus().length;
        const workers = Array.from({ length: numWorkers }, () => new Worker(workerPath));
        const workerPool = new WorkerTaskQueue<CodemodTaskInput, CodemodTaskWorkerResult>(workers);
        if (verbose) {
          log(stderr, `Running in multi-threaded mode with ${numWorkers} workers`);
        }
        // Process the tasks by dispatching them to the worker pool
        return Promise.all(
          inputFilePaths.map((inputFilePath) => {
            return workerPool
              .run(
                { inputFilePath, dryRun, applyDangerousEdits },
                {
                  onQueue: verbose
                    ? () => {
                        log(stderr, `Queueing ${relative(cwd, inputFilePath)}`);
                      }
                    : undefined,
                  onStart: () => {
                    log(stderr, `Processing ${relative(cwd, inputFilePath)}`);
                  },
                  onComplete: verbose
                    ? ({ runningTime }) => {
                        log(
                          stderr,
                          `Processed ${relative(cwd, inputFilePath)} in ${runningTime}ms`,
                        );
                      }
                    : undefined,
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

function getUnifiedDiff(
  from: { path: string; source: string },
  to: { path: string; source: string },
): string {
  return createTwoFilesPatch(from.path, to.path, from.source, to.source, undefined, undefined, {
    context: 3,
  });
}
