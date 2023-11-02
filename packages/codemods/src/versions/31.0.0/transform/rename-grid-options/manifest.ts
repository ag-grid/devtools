import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';
import { type TransformManifest } from '@ag-grid-devtools/types';

import renameGridOptions from './rename-grid-options';

const manifest: TransformManifest<AstTransform<AstCliContext>> = {
  name: 'Rename grid options',
  description: 'Transform deprecated grid options',
  transform: renameGridOptions,
};

export default manifest;
