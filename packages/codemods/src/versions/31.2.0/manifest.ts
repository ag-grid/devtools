import { type TransformManifest, type VersionManifest } from '@ag-grid-devtools/types';

import transformGridOptionsV31_2 from '../../transforms/transform-grid-options-v31-2/manifest.ts';

const transforms: Array<TransformManifest> = [transformGridOptionsV31_2];

const manifest: VersionManifest = {
  version: '31.2.0',
  codemodPath: 'version/31.2.0/codemod.cjs',
  workerPath: 'version/31.2.0/worker.cjs',
  transforms,
};

export default manifest;
