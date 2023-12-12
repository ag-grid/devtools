import {
  type Codemod,
  type CodemodInput,
  type CodemodOptions,
  type CodemodResult,
} from '@ag-grid-devtools/types';

import transformsManifest from './transform/manifest';
import { transformFile } from '@ag-grid-devtools/codemod-utils';

const transforms = transformsManifest.map(({ transform }) => transform);

const codemod: Codemod = function transform(
  file: CodemodInput,
  options: CodemodOptions,
): CodemodResult {
  const { path, source } = file;
  const { applyDangerousEdits, fs } = options;
  return transformFile(source, transforms, {
    sourceFilename: path,
    applyDangerousEdits: Boolean(applyDangerousEdits),
    fs,
  });
};

export default codemod;
