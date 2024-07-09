import type { ReadableStream, WritableStream } from './io';

export interface CliOptions {
  cwd: string;
  env: CliEnv;
  stdio: CliStdio;
  topmostGitRoot?: string;
}

export interface CliEnv extends Record<string, string | undefined> {}

export interface CliStdio {
  stdin: ReadableStream;
  stdout: WritableStream;
  stderr: WritableStream;
}
