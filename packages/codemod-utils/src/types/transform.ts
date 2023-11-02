import { ParserOptions } from '@ag-grid-devtools/ast';

export type AstTransformOptions = ParserOptions &
  Required<Pick<ParserOptions, 'sourceFilename'>> &
  AstTransformReporterOptions;

export interface AstTransformReporterOptions {
  applyDangerousEdits: boolean;
}
