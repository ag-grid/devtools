import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';
import { type VersionManifest } from '@ag-grid-devtools/types';

import codemod from './codemod';
import transforms from './transform/manifest';

const manifest: VersionManifest<AstTransform<AstCliContext>> = {
  version: '31.0.0',
  codemod,
  transforms,
};

export default manifest;
