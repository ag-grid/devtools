import { type TransformManifest } from '@ag-grid-devtools/types';

const manifest: TransformManifest = {
  name: 'Migrate legacy JavaScript Grid API',
  description: 'Transform `new Grid()` usages to `createGrid()`',
};

export default manifest;
