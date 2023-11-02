import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';
import { type PackageManifest } from '@ag-grid-devtools/types';

import versions from './src/versions/manifest';

const manifest: PackageManifest<AstTransform<AstCliContext>> = {
  name: 'AG Grid migration packages',
  versions,
};

export default manifest;
