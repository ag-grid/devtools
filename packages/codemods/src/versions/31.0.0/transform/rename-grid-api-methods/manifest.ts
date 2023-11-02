import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';
import { type TransformManifest } from '@ag-grid-devtools/types';

import renameGridApiMethods from './rename-grid-api-methods';

const manifest: TransformManifest<AstTransform<AstCliContext>> = {
  name: 'Rename Grid API methods',
  description: 'Transform deprecated Grid API method invocations',
  transform: renameGridApiMethods,
};

export default manifest;
