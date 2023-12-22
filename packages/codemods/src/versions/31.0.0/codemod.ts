import { transformFile } from '@ag-grid-devtools/codemod-utils';
import {
  type Codemod,
  type CodemodInput,
  type CodemodOptions,
  type CodemodResult,
} from '@ag-grid-devtools/types';

import migrateLegacyJsGridConstructor from './transform/migrate-legacy-js-grid-constructor';
import migrateLegacyColumnApi from './transform/migrate-legacy-column-api';
import renameGridApiMethods from './transform/rename-grid-api-methods';
import renameGridOptions from './transform/rename-grid-options';

const transforms = [
  migrateLegacyJsGridConstructor,
  migrateLegacyColumnApi,
  renameGridApiMethods,
  renameGridOptions,
];

const codemod: Codemod = function transform(
  file: CodemodInput,
  options: CodemodOptions,
): CodemodResult {
  const { path, source } = file;
  const { applyDangerousEdits, fs } = options;
  return transformFile(source, transforms, {
    filename: path,
    applyDangerousEdits: Boolean(applyDangerousEdits),
    fs,
  });
};

export default codemod;
