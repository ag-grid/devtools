import codemod from '@ag-grid-devtools/codemods/src/versions/31.0.0/codemod';
import versions from '@ag-grid-devtools/codemods/src/versions/manifest';
import { type CodemodFsUtils, type VersionManifest } from '@ag-grid-devtools/types';
import { nonNull } from '@ag-grid-devtools/utils';
import { createTwoFilesPatch } from 'diff';
import gracefulFs from 'graceful-fs';
import semver from 'semver';

import { type CliEnv, type CliOptions } from '../types/cli';
import { type WritableStream } from '../types/io';
import { CliArgsError, CliError } from '../utils/cli';
import { findInDirectory, isFsErrorCode, readFile, writeFile } from '../utils/fs';
import { findInGitRepository, getGitProjectRoot, getUncommittedGitFiles } from '../utils/git';
import { basename, extname, resolve, relative } from '../utils/path';
import { getCliCommand } from '../utils/pkg';
import { green, indentErrorMessage, log } from '../utils/stdio';

const SOURCE_FILE_EXTENSIONS = ['.cjs', '.js', '.mjs', '.jsx', '.ts', '.tsx', '.vue'];
const LATEST_VERSION = versions[versions.length - 1].version;

export interface MigrateCommandArgs {
  /**
   * Semver version to migrate from
   */
  from: VersionManifest<any>['version'];
  /**
   * Semver version to migrate to
   */
  to: VersionManifest<any>['version'];
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
  Required arguments:

  Optional arguments:
    --to=<version>            AG Grid semver version to migrate to (defaults to ${green(
      LATEST_VERSION,
      env,
    )})
    --from=<version>          AG Grid semver version to migrate from
    --allow-untracked, -u     Allow operating on files outside a git repository
    --allow-dirty, -d         Allow operating on repositories with uncommitted changes in the working tree
    --apply-dangerous-edits   Automatically apply fixes that potentially change application behavior
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
  const { from, to, allowUntracked, allowDirty, applyDangerousEdits, dryRun, input, verbose } =
    args;
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

  await log(
    stderr,
    `Migrating${from ? ` from version ${green(from, env)}` : ''} to version ${green(to, env)}...`,
  );

  const startTime = Date.now();
  const results = await Promise.all(
    inputFilePaths.map((inputFilePath) => {
      if (verbose) {
        log(stderr, `Processing ${relative(cwd, inputFilePath)}`);
      }
      return readFile(inputFilePath, 'utf-8')
        .catch((error) =>
          Promise.reject(
            isFsErrorCode('ENOENT', error) ? new Error(`File not found: ${inputFilePath}`) : error,
          ),
        )
        .then((source) => {
          const { source: updated, errors } = codemod(
            { path: inputFilePath, source },
            {
              applyDangerousEdits,
              fs: createFsHelpers(gracefulFs),
            },
          );
          const isUnchanged = updated === source;
          const result = { source, updated: isUnchanged ? null : updated };
          if (dryRun || !updated || isUnchanged) return { result, errors };
          return writeFile(inputFilePath, updated).then(() => ({ result, errors }));
        })
        .then(({ result, errors }) => ({ path: inputFilePath, result, errors }))
        .catch((error) => ({
          path: inputFilePath,
          result: { source: null, updated: null },
          errors: [error],
        }));
    }),
  );
  const elapsedTime = Date.now() - startTime;

  const successResults = results
    .map((result) => (result.errors.length === 0 ? result : null))
    .filter(nonNull);
  const errorResults = results
    .map((result) => (result.errors.length > 0 ? result : null))
    .filter(nonNull);
  const changedResults = successResults.filter((result) => result.result.updated);
  const unchangedResults = successResults.filter((result) => !result.result.updated);

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
    `Migration completed in ${elapsedTime}ms (${changedResults.length} modified, ${unchangedResults.length} unmodified, ${errorResults.length} failed, ${results.length} total)`,
  );

  if (errorResults.length > 0) {
    await log(stderr, '');
    throw new CliError(
      `Failed to process ${errorResults.length} ${errorResults.length === 1 ? 'file' : 'files'}`,
      errorResults
        .map(
          ({ path, errors }) =>
            `${relative(cwd, path)}:\n\n${errors
              .map((error) => indentErrorMessage(error.message, { indent: '  ' }))
              .join('\n\n')}\n`,
        )
        .join('\n'),
    );
  }

  return successResults.map(({ path }) => path);
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

function createFsHelpers(fs: typeof gracefulFs): CodemodFsUtils {
  return {
    readFileSync,
    writeFileSync,
  };

  function readFileSync(filename: string, encoding: 'utf-8'): string;
  function readFileSync(filename: string, encoding: BufferEncoding): string | Buffer;
  function readFileSync(filename: string, encoding: BufferEncoding): string | Buffer {
    return fs.readFileSync(filename, encoding);
  }

  function writeFileSync(filename: string, data: string | Buffer): void {
    return fs.writeFileSync(filename, data);
  }
}
