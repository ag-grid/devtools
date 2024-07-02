import { type TransformManifest, type VersionManifest } from '@ag-grid-devtools/types';

import transformGridOptionsV32_0 from '../../transforms/transform-grid-options-v32-0/manifest.ts';

import transformGridApiMethodsV32_0 from '../../transforms/transform-grid-api-methods-v32-0/manifest.ts';

const transforms: Array<TransformManifest> = [
  transformGridOptionsV32_0,
  transformGridApiMethodsV32_0,
];

const manifest: VersionManifest = {
  version: '32.0.0',
  codemodPath: 'version/32.0.0',
  transforms,
};

export default manifest;
