import { readFile, cp, mkdir, rm, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { dynamicRequire } from '@ag-grid-devtools/utils';
import prettier from 'prettier';
import { CliOptions } from '../../types/cli';
import { execCommand } from '../../utils/exec';
import { glob } from 'glob';
import { existsSync } from 'fs';

export class CliE2ETestEnv {
  public readonly TIMEOUT = 30000;

  public readonly rootFolder: string;

  public readonly tempFolder: string;

  public readonly inputFolder: string;

  public readonly expectedFolder: string;

  public cliOptions: CliOptions;

  public constructor(public readonly metaUrl: string) {
    this.rootFolder = path.resolve(path.dirname(fileURLToPath(metaUrl)));
    this.tempFolder = path.resolve(this.rootFolder, '_temp');
    this.inputFolder = path.resolve(this.rootFolder, 'input-files');
    this.expectedFolder = path.resolve(this.rootFolder, 'expected');

    this.cliOptions = {
      cwd: this.tempFolder,
      env: {
        cwd: this.tempFolder,
      },
      stdio: {
        stdin: process.stdin,
        stdout: process.stdout,
        stderr: process.stderr,
      },
    };
  }

  public async teardown() {
    try {
      await rm(this.tempFolder, { recursive: true });
    } catch {
      // already deleted
    }
  }

  public async removeGitFolder() {
    try {
      await rm(path.join(this.tempFolder, '.git'), { recursive: true });
    } catch {
      // already deleted
    }
  }

  public async execCommand(command: string, args: string[], options?: { cwd?: string }) {
    try {
      return await execCommand(command, args, { cwd: this.tempFolder, ...options });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async init({ gitInit = false }: { gitInit?: boolean } = {}) {
    await this.teardown();

    if (gitInit) {
      await mkdir(this.tempFolder, { recursive: true });

      await this.execCommand('git', ['init']);
    } else {
      // create a .git directory to simulate a git repository
      await mkdir(path.join(this.tempFolder, '.git'), { recursive: true });
    }

    const inputPath = this.inputFolder;

    const promises: Promise<unknown>[] = [];

    if (existsSync(inputPath)) {
      // copy all files from the input folder to the temp folder
      promises.push(
        cp(inputPath, this.tempFolder, {
          recursive: true,
          force: true,
          filter: (src) => !path.basename(src).startsWith('_'),
        }),
      );

      // copy all files starting with _ removing the _ from the name

      const allFiles = glob.sync('**/_*', { cwd: inputPath, nodir: true, absolute: true });
      for (const file of allFiles) {
        promises.push(
          mkdir(path.dirname(file), { recursive: true }).then(() => {
            const targetFolder = path.resolve(
              this.tempFolder,
              path.relative(inputPath, path.dirname(file)),
            );
            const name = path.basename(file).slice(1);
            cp(file, path.resolve(this.tempFolder, targetFolder, name), { force: true });
          }),
        );
      }
    }

    await Promise.all(promises);

    if (gitInit) {
      await this.execCommand('git', ['add', '.']);

      await this.execCommand('git', ['config', 'user.email', 'cli-e2e@ag-grid.com']);
      await this.execCommand('git', ['config', 'user.name', 'cli-e2e']);

      await this.execCommand('git', ['commit', '-m', 'Initial commit']);
    }

    return this;
  }

  public async loadInputSrc(name: string) {
    return loadSourceFile(path.resolve(this.tempFolder, name));
  }

  public async loadExpectedSrc(name: string) {
    return loadSourceFile(path.resolve(this.expectedFolder, name));
  }

  public async loadTempSrc(name: string) {
    return loadSourceFile(path.resolve(this.tempFolder, name));
  }

  public async writeTempSrc(filename: string, content: string) {
    await mkdir(path.dirname(path.resolve(this.tempFolder, filename)), { recursive: true });
    await writeFile(path.resolve(this.tempFolder, filename), content);
  }

  public async addGitFile(filename: string) {
    await this.execCommand('git', ['add', filename]);
  }
}

async function loadSourceFile(filepath: string): Promise<string> {
  return prettier.format(await readFile(filepath, 'utf-8'), { filepath });
}
