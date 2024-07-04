import { type FsUtils } from './fs';
import { type Task } from './task';
import { UserConfig } from './user-config';

export interface Codemod {
  (file: CodemodInput, options: CodemodOptions): CodemodResult;
}

export interface CodemodInput {
  path: string;
  source: string;
}

export interface CodemodOptions {
  fs: FsUtils;
  userConfig: UserConfig | undefined;
}

export interface CodemodResult {
  source: string | null;
  errors: Array<Error>;
  warnings: Array<Error>;
}

export interface CodemodTask extends Task<CodemodTaskInput, CodemodTaskResult> {}

export interface CodemodTaskInput {
  inputFilePath: string;
  dryRun: boolean;
}

export interface CodemodTaskResult {
  result: { source: string; updated: string | null };
  errors: Array<Error>;
  warnings: Array<Error>;
}

export type CodemodTaskWorkerResult =
  | {
      success: true;
      value: CodemodTaskResult;
    }
  | {
      success: false;
      error: any;
    };
