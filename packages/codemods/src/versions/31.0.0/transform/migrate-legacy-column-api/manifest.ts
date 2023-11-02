import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';
import { type TransformManifest } from '@ag-grid-devtools/types';

import migrateLegacyColumnApi from './migrate-legacy-column-api';

const manifest: TransformManifest<AstTransform<AstCliContext>> = {
  name: 'Migrate legacy Column API',
  description: 'Transform `.columnApi` usages to `.api`',
  transform: migrateLegacyColumnApi,
};

export default manifest;
