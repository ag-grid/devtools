import { nonNull } from '@ag-grid-devtools/utils';
import { execCommand } from './exec';

const GIT_STATUS_LINE_REGEX = /^\s*([^ ]+)\s*(.*)$/;

export async function findInGitRepository(
  filenamePatterns: Array<string>,
  options: {
    gitRepository: string;
  },
): Promise<Array<string>> {
  const { gitRepository } = options;
  const { stdout } = await execCommand(
    'git',
    ['ls-files', '--exclude-standard', '--', ...filenamePatterns],
    {
      cwd: gitRepository,
    },
  );
  const filenames = stdout.split('\n').filter((line) => line.length > 0);
  return filenames;
}

export async function getUncommittedGitFiles(gitProjectRoot: string): Promise<Array<string>> {
  const { stdout } = await execCommand('git', ['status', '--porcelain', '--untracked-files=no'], {
    cwd: gitProjectRoot,
  });
  return stdout
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => {
      const match = line.match(GIT_STATUS_LINE_REGEX);
      return match ? match[2] : null;
    })
    .filter(nonNull);
}
