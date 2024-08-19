import { type PackageManifest } from '@ag-grid-devtools/types';

import versions from './versions/manifest';

const manifest: PackageManifest = {
  name: 'AG Grid migration packages',
  versions,
};

export default manifest;
