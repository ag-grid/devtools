import { type TransformManifest, type VersionManifest } from '@ag-grid-devtools/types';

import transformGridApiMethodsV33_0 from '../../transforms/transform-grid-api-methods-v33-0/manifest.ts';

import migrateSparklinesOptions from '../../transforms/migrate-sparklines-options/manifest.ts';

const transforms: Array<TransformManifest> = [
  transformGridApiMethodsV33_0,
  migrateSparklinesOptions,
];

const manifest: VersionManifest = {
  version: '33.0.0',
  codemodPath: 'versions/33.0.0',
  transforms,
};

export default manifest;
