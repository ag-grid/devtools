import { transformFileAst } from '@ag-grid-devtools/codemod-utils';
import {
  type Codemod,
  type CodemodInput,
  type CodemodOptions,
  type CodemodResult,
} from '@ag-grid-devtools/types';

import transforms from './transforms';

const codemod: Codemod = function codemodV<%= versionIdentifier %>(
  file: CodemodInput,
  options: CodemodOptions,
): CodemodResult {
  const { path, source } = file;
  const { fs, userConfig } = options;
  return transformFileAst(source, transforms, {
    filename: path,
    fs,
    userConfig,
  });
};

export default codemod;
