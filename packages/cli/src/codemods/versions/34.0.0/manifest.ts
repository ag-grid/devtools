import { type TransformManifest, type VersionManifest } from '@ag-grid-devtools/types';

import transformGridApiMethodsV34_0 from '../../transforms/transform-grid-api-methods-v34-0/manifest.ts';

const transforms: Array<TransformManifest> = [transformGridApiMethodsV34_0];

const manifest: VersionManifest = {
  version: '34.0.0',
  codemodPath: 'versions/34.0.0',
  transforms,
};

export default manifest;
