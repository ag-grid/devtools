import {
  UserConfig,
  type Codemod,
  type CodemodTask,
  type CodemodTaskInput,
  type CodemodTaskResult,
  type TaskRunnerEnvironment,
} from '@ag-grid-devtools/types';
import { dynamicRequire } from '@ag-grid-devtools/utils';

export function createCodemodTask(
  codemod: Codemod,
  userConfig: UserConfig | undefined,
): CodemodTask {
  return {
    run(input: CodemodTaskInput, runner: TaskRunnerEnvironment): Promise<CodemodTaskResult> {
      const { fs } = runner;
      const { readFile, writeFile } = fs;
      const { inputFilePath, dryRun } = input;
      return readFile(inputFilePath, 'utf-8')
        .catch((error) =>
          Promise.reject(
            isFsErrorCode('ENOENT', error) ? new Error(`File not found: ${inputFilePath}`) : error,
          ),
        )
        .then((source) => {
          const {
            source: updated,
            errors,
            warnings,
          } = codemod({ path: inputFilePath, source }, { fs, userConfig });
          const isUnchanged = updated === source;
          const result = { source, updated: isUnchanged ? null : updated };
          if (dryRun || !updated || isUnchanged) return { result, errors, warnings };
          return writeFile(inputFilePath, updated).then(() => ({ result, errors, warnings }));
        });
    },
  };
}

function isFsErrorCode<T extends string>(error: unknown, code: T): error is Error & { code: T } {
  return error instanceof Error && (error as Error & { code?: string }).code === code;
}

export function loadUserConfig(userConfigPath: string | undefined): UserConfig | undefined {
  return userConfigPath ? dynamicRequire.require(userConfigPath, import.meta) : undefined;
}
