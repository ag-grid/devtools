import {
  parseAst,
  transformAst,
  type AstCliContext,
  type AstNode,
  type AstTransform,
  type AstTransformContext,
  type AstTransformResult,
  type AstTransformWithOptions,
  type NodePath,
  type ParserOptions,
  type ParserPlugin,
} from '@ag-grid-devtools/ast';
import { parse, print } from 'recast';

import { type AstTransformOptions } from '../types';

const PARSER_PLUGINS: Array<ParserPlugin> = ['jsx', 'typescript', 'decorators-legacy'];

export function transformJsScriptFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions,
): AstTransformResult {
  return transformJsFile(source, transforms, {
    ...options,
    sourceType: options.sourceType || 'script',
  });
}

export function transformJsModuleFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions,
): AstTransformResult {
  return transformJsFile(source, transforms, {
    ...options,
    sourceType: options.sourceType || 'module',
  });
}

export function transformJsUnknownFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions,
): AstTransformResult {
  return transformJsFile(source, transforms, {
    ...options,
    // Determine whether module/script based on file contents
    sourceType: options.sourceType || 'unambiguous',
  });
}

export function transformJsFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions & Required<Pick<ParserOptions, 'sourceType'>>,
): AstTransformResult {
  const { applyDangerousEdits, fs, ...parserOptions } = options;
  const ast = parse(source, {
    parser: {
      sourceFilename: parserOptions.sourceFilename,
      parse(source: string): ReturnType<typeof parseAst> {
        const { plugins } = parserOptions;
        return parseAst(source, {
          ...parserOptions,
          plugins: plugins ? [...PARSER_PLUGINS, ...plugins] : PARSER_PLUGINS,
          tokens: true,
        });
      },
    },
  }) as ReturnType<typeof parseAst>;
  const uniqueErrors = new Map<string, SyntaxError>();
  const transformContext: AstTransformContext<AstCliContext> = {
    filename: parserOptions.sourceFilename,
    opts: {
      applyDangerousEdits,
      warn(node: NodePath<AstNode> | null, message: string) {
        const error = node ? node.buildCodeFrameError(message) : new SyntaxError(message);
        uniqueErrors.set(error.message, error);
      },
      fs,
    },
  };
  const transformedAst = transformAst(ast, transforms, transformContext, { source });
  if (!transformedAst && uniqueErrors.size === 0) return { source: null, errors: [] };
  const transformedSource = transformedAst ? print(transformedAst).code : null;
  return {
    source: transformedSource === source ? null : transformedSource,
    errors: Array.from(uniqueErrors.values()),
  };
}
