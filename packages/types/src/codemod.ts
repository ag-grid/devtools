export interface Codemod {
  (file: CodemodInput, options?: CodemodOptions): CodemodResult;
}

export interface CodemodInput {
  path: string;
  source: string;
}

export interface CodemodOptions {
  applyDangerousEdits?: boolean;
}

export interface CodemodResult {
  source: string | null;
  errors: Array<Error>;
}
