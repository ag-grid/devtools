import { type FileMetadata } from '@ag-grid-devtools/ast';
import { type FsUtils } from '@ag-grid-devtools/types';

export type AstTransformOptions = FileMetadata & AstTransformCliOptions;

export interface AstTransformCliOptions {
  applyDangerousEdits: boolean;
  fs: FsUtils;
}
