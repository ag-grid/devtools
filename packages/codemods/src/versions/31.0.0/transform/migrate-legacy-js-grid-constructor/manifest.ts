import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';
import { type TransformManifest } from '@ag-grid-devtools/types';

import migrateLegacyJsGridConstructor from './migrate-legacy-js-grid-constructor';

const manifest: TransformManifest<AstTransform<AstCliContext>> = {
  name: 'Migrate legacy JavaScript Grid API',
  description: 'Transform `new Grid()` usages to `createGrid()`',
  transform: migrateLegacyJsGridConstructor,
};

export default manifest;
