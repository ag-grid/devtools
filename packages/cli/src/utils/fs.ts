import { resolve, join, relative, dirname, sep as pathSeparator } from 'node:path';
import { stat } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { glob } from 'glob';
import createIgnore, { Ignore } from 'ignore';

const DOT_DOT_SLASH = '..' + pathSeparator;

export function isFsErrorCode<T extends string>(
  error: unknown,
  code: T,
): error is Error & { code: T } {
  return error instanceof Error && (error as Error & { code?: string }).code === code;
}

export async function findGitRoot(path: string): Promise<string | undefined> {
  let current = path;
  for (;;) {
    try {
      const gitPath = join(current, '.git');
      if (existsSync(gitPath) && (await stat(gitPath)).isDirectory()) {
        return current;
      }
    } catch {}
    const parent = dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

async function resolveFilesOrDirectories(
  input: string[],
  cwd: string,
): Promise<{ filesSet: Set<string>; directoriesSet: Set<string> }> {
  const files = new Set<string>();
  const directories = new Set<string>();

  const checks = input.map(async (item) => {
    const fullPath = resolve(cwd, item);
    try {
      const statResult = await stat(fullPath);
      if (statResult.isDirectory()) {
        directories.add(fullPath);
      } else {
        files.add(fullPath);
      }
    } catch {
      files.add(fullPath);
    }
  });

  await Promise.all(checks);

  return { filesSet: files, directoriesSet: directories };
}

export async function findSourceFiles(
  cwd: string,
  paths: string[],
  extensions: string[],
  skipFiles: ReadonlySet<string> | null,
  gitRoot: string | undefined,
): Promise<Array<string>> {
  const { filesSet, directoriesSet } = await resolveFilesOrDirectories(paths, cwd);

  for (let path of directoriesSet) {
    path = resolve(path);
    for (const file of await glob(
      extensions.map((ext) => `**/*${ext}`),
      {
        dot: true,
        cwd: path,
        nodir: true,
        absolute: true,
        ignore: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.hg/**',
          '**/.svn/**',

          // ignore .d.ts files as we cannot properly parse and process them
          '**/*.d.ts',
        ],
      },
    )) {
      filesSet.add(file);
    }
  }

  let files = Array.from(filesSet);

  if (skipFiles && skipFiles.size > 0) {
    files = files.filter((file) => !skipFiles.has(file));
  }

  interface DirGitignore {
    directory: string;
    ignore: Ignore;
    parent: DirGitignore | null | undefined;
  }

  const ignoreCache = new Map<string, DirGitignore | null>();

  function getParentIgnorer(directory: string): DirGitignore | null {
    const parent = dirname(directory);
    return parent !== directory ? getIgnorer(parent) : null;
  }

  function getIgnorer(directory: string): DirGitignore | null {
    let result = ignoreCache.get(directory);
    if (result !== undefined) {
      return result;
    }

    result = null;

    if (!gitRoot || !relative(gitRoot, directory).startsWith(DOT_DOT_SLASH)) {
      let content: string | undefined;
      const gitignorePath = join(directory, '.gitignore');
      try {
        content = readFileSync(gitignorePath, 'utf-8');
      } catch {}

      result = content
        ? { directory, ignore: createIgnore().add(content), parent: undefined }
        : getParentIgnorer(directory);
    }

    ignoreCache.set(directory, result);
    return result;
  }

  function isIgnored(path: string, ignorer: DirGitignore | null) {
    if (!ignorer) {
      return false;
    }
    const testResult = ignorer.ignore.test(relative(ignorer.directory, path));
    if (testResult.ignored) {
      return true;
    }
    if (testResult.unignored) {
      return false;
    }
    if (ignorer.parent === undefined) {
      ignorer.parent = getParentIgnorer(ignorer.directory);
    }
    return isIgnored(path, ignorer.parent);
  }

  files = files.filter((file) => !isIgnored(file, getIgnorer(dirname(file))));

  return files;
}
