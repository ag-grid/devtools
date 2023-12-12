import { type FileMetadata, type ParserOptions } from '@ag-grid-devtools/ast';
import { type CodemodFsUtils } from '@ag-grid-devtools/types';

export type AstTransformOptions = FileMetadata & AstTransformCliOptions;

export interface AstTransformCliOptions {
  applyDangerousEdits: boolean;
  fs: CodemodFsUtils;
}

export interface AstTransformJsOptions {
  js?: Omit<ParserOptions, 'sourceFilename' | 'sourceType'>;
}

export interface AstTransformJsxOptions {
  jsx: boolean;
}
