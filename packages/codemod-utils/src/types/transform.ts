import { type ParserOptions } from '@ag-grid-devtools/ast';
import { type CodemodFsUtils } from '@ag-grid-devtools/types';

export type AstTransformOptions = ParserOptions &
  Required<Pick<ParserOptions, 'sourceFilename'>> &
  AstTransformCliOptions;

export interface AstTransformCliOptions {
  applyDangerousEdits: boolean;
  fs: CodemodFsUtils;
}
