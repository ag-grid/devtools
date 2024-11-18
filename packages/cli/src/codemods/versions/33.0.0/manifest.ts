import { type TransformManifest, type VersionManifest } from '@ag-grid-devtools/types';

import transformGridApiMethodsV33_0 from '../../transforms/transform-grid-api-methods-v33-0/manifest.ts';

import transformSparklinesOptionsV33_0 from '../../transforms/transform-sparklines-options-v33-0/manifest.ts';

const transforms: Array<TransformManifest> = [
  transformGridApiMethodsV33_0,
  transformSparklinesOptionsV33_0,
];

const manifest: VersionManifest = {
  version: '33.0.0',
  codemodPath: 'versions/33.0.0',
  transforms,
};

export default manifest;
