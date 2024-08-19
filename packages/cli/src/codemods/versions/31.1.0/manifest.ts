import { type TransformManifest, type VersionManifest } from '@ag-grid-devtools/types';

import transformGridApiMethodsV31_1 from '../../transforms/transform-grid-api-methods-v31-1/manifest.ts';

import transformGridOptionsV31_1 from '../../transforms/transform-grid-options-v31-1/manifest.ts';

const transforms: Array<TransformManifest> = [
  transformGridApiMethodsV31_1,
  transformGridOptionsV31_1,
];

const manifest: VersionManifest = {
  version: '31.1.0',
  codemodPath: 'versions/31.1.0',
  transforms,
};

export default manifest;
