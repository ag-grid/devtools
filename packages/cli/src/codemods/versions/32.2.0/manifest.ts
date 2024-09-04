import { type TransformManifest, type VersionManifest } from '@ag-grid-devtools/types';

import transformGridApiMethodsV32_2 from '../../transforms/transform-grid-api-methods-v32-2/manifest.ts';

import transformGridOptionsV32_2 from '../../transforms/transform-grid-options-v32-2/manifest.ts';

const transforms: Array<TransformManifest> = [
  transformGridApiMethodsV32_2,
  transformGridOptionsV32_2,
];

const manifest: VersionManifest = {
  version: '32.2.0',
  codemodPath: 'versions/32.2.0',
  transforms,
};

export default manifest;
