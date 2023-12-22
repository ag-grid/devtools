import { type VersionManifest } from '@ag-grid-devtools/types';

import transforms from './transform/manifest';

const manifest: VersionManifest = {
  version: '31.0.0',
  codemodPath: 'version/31.0.0/codemod.cjs',
  workerPath: 'version/31.0.0/worker.cjs',
  transforms,
};

export default manifest;
