import { resolve, join } from 'node:path';
import { globby } from 'globby';
import { stat } from 'fs/promises';

export function isFsErrorCode<T extends string>(
  error: unknown,
  code: T,
): error is Error & { code: T } {
  return error instanceof Error && (error as Error & { code?: string }).code === code;
}

export interface GitRootAndGitIgnoreFiles {
  gitRoot: string;
  hasGitRoot: boolean;
  gitIgnoreFiles: string[];
}

export async function loadGitRootAndGitIgnoreFiles(
  path: string,
): Promise<GitRootAndGitIgnoreFiles> {
  const gitIgnoreFiles: string[] = [];
  let gitRoot: string = path;
  let hasGitRoot = false;

  const loadParentGitIgnoreFiles = async (current: string): Promise<void> => {
    current = resolve(current);
    gitRoot = current;
    try {
      const currentGitIgnore = join(current, '.gitignore');
      const gitignoreFile = await stat(currentGitIgnore);
      if (gitignoreFile.isFile()) {
        // We found a valid parent .gitignore to process
        gitIgnoreFiles.unshift(currentGitIgnore);
      }
    } catch {}

    try {
      await stat(join(current, '.git'));
      hasGitRoot = true;
    } catch {
      // .git directory does not exist, we can continue
      gitRoot = resolve(current, '..');
      if (gitRoot !== current) {
        loadParentGitIgnoreFiles(gitRoot);
      }
    }
  };

  await loadParentGitIgnoreFiles(resolve(path));

  return { gitRoot, hasGitRoot, gitIgnoreFiles };
}

export async function findSourceFiles(
  path: string,
  extensions: string[],
  gitIgnoreFiles: string[],
): Promise<Array<string>> {
  path = resolve(path);

  return globby(
    extensions.map((ext) => `*${ext}`),
    {
      onlyFiles: true,
      absolute: true,
      suppressErrors: true,
      cwd: path,
      gitignore: true,
      ignoreFiles: [...gitIgnoreFiles, '.gitignore'],
      ignore: ['**/node_modules/**', '**/.git/**'],
    },
  );
}
