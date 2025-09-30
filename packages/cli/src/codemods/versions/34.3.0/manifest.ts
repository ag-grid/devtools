import { type TransformManifest, type VersionManifest } from '@ag-grid-devtools/types';

import transformGridOptionsV34_3 from '../../transforms/transform-grid-options-v34-3/manifest.ts';

const transforms: Array<TransformManifest> = [transformGridOptionsV34_3];

const manifest: VersionManifest = {
  version: '34.3.0',
  codemodPath: 'versions/34.3.0',
  transforms,
};

export default manifest;
