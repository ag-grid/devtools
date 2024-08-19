import { type TransformManifest, type VersionManifest } from '@ag-grid-devtools/types';

import transformGridApiMethodsV31_3 from '../../transforms/transform-grid-api-methods-v31-3/manifest.ts';

import transformGridOptionsV31_3 from '../../transforms/transform-grid-options-v31-3/manifest.ts';

const transforms: Array<TransformManifest> = [
  transformGridApiMethodsV31_3,
  transformGridOptionsV31_3,
];

const manifest: VersionManifest = {
  version: '31.3.0',
  codemodPath: 'versions/31.3.0',
  transforms,
};

export default manifest;
