import {
  type AstCliContext,
  type AstNode,
  type AstTransform,
  type AstTransformContext,
  type AstTransformResult,
  type AstTransformWithOptions,
  type NodePath,
  type ParserOptions,
} from '@ag-grid-devtools/ast';
import { partition } from '@ag-grid-devtools/utils';

import { type AstTransformOptions } from '../types';
import {
  applyBabelTransform,
  type BabelTransformJsOptions,
  type BabelTransformJsxOptions,
} from '../babelHelpers';

export function transformJsScriptFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions & BabelTransformJsOptions & BabelTransformJsxOptions,
): AstTransformResult {
  return transformJsFile(source, transforms, {
    ...options,
    sourceType: 'script',
  });
}

export function transformJsModuleFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions & BabelTransformJsOptions & BabelTransformJsxOptions,
): AstTransformResult {
  return transformJsFile(source, transforms, {
    ...options,
    sourceType: 'module',
  });
}

export function transformJsUnknownFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions & BabelTransformJsOptions & BabelTransformJsxOptions,
): AstTransformResult {
  return transformJsFile(source, transforms, {
    ...options,
    // Determine whether module/script based on file contents
    sourceType: 'unambiguous',
  });
}

function transformJsFile<S>(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions &
    BabelTransformJsOptions &
    BabelTransformJsxOptions &
    Required<Pick<ParserOptions, 'sourceType'>>,
): AstTransformResult {
  const { filename, fs } = options;
  // Transform the AST
  const uniqueErrors = new Map<string, { fatal: boolean; error: SyntaxError }>();
  const transformContext: AstTransformContext<AstCliContext> = {
    filename,
    opts: {
      warn(node: NodePath<AstNode> | null, message: string) {
        const error = createSourceCodeError(node, message);
        uniqueErrors.set(error.message, { error, fatal: false });
      },
      fail(node: NodePath<AstNode> | null, message: string) {
        const error = createSourceCodeError(node, message);
        uniqueErrors.set(error.message, { error, fatal: true });
      },
      fs,
    },
  };
  const plugins = transforms.map((plugin): AstTransformWithOptions<AstCliContext> => {
    const { opts } = transformContext;
    if (Array.isArray(plugin)) {
      const [pluginFn, pluginOptions] = plugin;
      return [pluginFn, { ...opts, ...pluginOptions }];
    } else {
      return [plugin, opts];
    }
  });
  const transformedSource = applyBabelTransform(source, plugins, options);
  // If there were no modifications to the AST, return a null result
  if (!transformedSource && uniqueErrors.size === 0) {
    return { source: null, errors: [], warnings: [] };
  }
  const [errors, warnings] = partition(Array.from(uniqueErrors.values()), (error) => error.fatal);
  return {
    source: transformedSource === source ? null : transformedSource,
    errors: errors.map(({ error }) => error),
    warnings: warnings.map(({ error }) => error),
  };
}

function createSourceCodeError(node: NodePath<AstNode> | null, message: string): Error {
  return node ? node.buildCodeFrameError(message) : new SyntaxError(message);
}
