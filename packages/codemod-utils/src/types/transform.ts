import { type FileMetadata, type ParserOptions } from '@ag-grid-devtools/ast';
import { type FsUtils } from '@ag-grid-devtools/types';

export type AstTransformOptions = FileMetadata & AstTransformCliOptions;

export interface AstTransformCliOptions {
  applyDangerousEdits: boolean;
  fs: FsUtils;
}

export interface AstTransformJsOptions {
  js?: Omit<ParserOptions, 'sourceFilename' | 'sourceType'>;
}

export interface AstTransformJsxOptions {
  jsx: boolean;
}
