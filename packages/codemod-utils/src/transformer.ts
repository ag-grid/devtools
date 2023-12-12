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
import { type AstTransformJsOptions, type AstTransformOptions } from './types';

export function transformFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions & AstTransformJsOptions,
): AstTransformResult {
  const extension = extname(options.filename);
  switch (extension) {
    case '.js':
    case '.jsx':
      return transformJsUnknownFile(source, transforms, {
        // JSX syntax is a superset of JS syntax, so assume all JS input files potentially contain JSX
        jsx: true,
        ...options,
      });
    case '.cjs':
      return transformJsScriptFile(source, transforms, {
        // JSX syntax is a superset of JS syntax, so assume all JS input files potentially contain JSX
        jsx: true,
        ...options,
      });
    case '.mjs':
      return transformJsModuleFile(source, transforms, {
        // JSX syntax is a superset of JS syntax, so assume all JS input files potentially contain JSX
        jsx: true,
        ...options,
      });
    case '.ts':
    case '.tsx':
      return transformJsModuleFile(source, transforms, {
        // See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-6.html#new-tsx-file-extension-and-as-operator
        // Legacy TypeScript cast syntax conflicts with JSX syntax, so only enable JSX parsing for .tsx files
        jsx: extension === '.tsx',
        ...options,
      });
    case '.vue':
      return transformVueSfcFile(source, transforms, options);
    default:
      return { source: null, errors: [] };
  }
}
