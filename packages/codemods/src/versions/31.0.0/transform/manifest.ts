import { type TransformManifest } from '@ag-grid-devtools/types';

import migrateLegacyColumnApi from './migrate-legacy-column-api/manifest';
import migrateLegacyJsGridConstructor from './migrate-legacy-js-grid-constructor/manifest';
import renameGridApiMethods from './rename-grid-api-methods/manifest';
import renameGridOptions from './rename-grid-options/manifest';

const transforms: Array<TransformManifest> = [
  migrateLegacyJsGridConstructor,
  migrateLegacyColumnApi,
  renameGridApiMethods,
  renameGridOptions,
];

export default transforms;
