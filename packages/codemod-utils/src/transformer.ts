import {
  type AstCliContext,
  type AstTransform,
  type AstTransformResult,
  type AstTransformWithOptions,
} from '@ag-grid-devtools/ast';
import { extname } from 'node:path';

import {
  transformJsModuleFile,
  transformJsScriptFile,
  transformJsUnknownFile,
  transformVueSfcFile,
} from './transform';
import { type AstTransformOptions } from './types';

export function transformFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions,
): AstTransformResult {
  const extension = extname(options.sourceFilename);
  switch (extension) {
    case '.cjs':
      return transformJsScriptFile(source, transforms, options);
    case '.js':
    case '.jsx':
      return transformJsUnknownFile(source, transforms, options);
    case '.mjs':
    case '.ts':
    case '.tsx':
      return transformJsModuleFile(source, transforms, options);
    case '.vue':
      return transformVueSfcFile(source, transforms, options);
    default:
      return { source: null, errors: [] };
  }
}
