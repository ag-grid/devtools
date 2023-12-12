export interface Codemod {
  (file: CodemodInput, options: CodemodOptions): CodemodResult;
}

export interface CodemodInput {
  path: string;
  source: string;
}

export interface CodemodOptions {
  applyDangerousEdits: boolean;
  fs: CodemodFsUtils;
}

export interface CodemodResult {
  source: string | null;
  errors: Array<Error>;
}

export interface CodemodFsUtils {
  readFileSync(filename: string, encoding: 'utf-8'): string;
  readFileSync(filename: string, encoding: BufferEncoding): string | Buffer;
  writeFileSync(filename: string, data: string | Buffer): void;
}
