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

import {
  type AstTransformJsOptions,
  type AstTransformJsxOptions,
  type AstTransformOptions,
} from '../types';

const JS_PARSER_PLUGINS: Array<ParserPlugin> = ['typescript', 'decorators-legacy'];
const JSX_PARSER_PLUGINS: Array<ParserPlugin> = ['jsx', ...JS_PARSER_PLUGINS];

export function transformJsScriptFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions & AstTransformJsOptions & AstTransformJsxOptions,
): AstTransformResult {
  return transformJsFile(source, transforms, {
    ...options,
    sourceType: 'script',
  });
}

export function transformJsModuleFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions & AstTransformJsOptions & AstTransformJsxOptions,
): AstTransformResult {
  return transformJsFile(source, transforms, {
    ...options,
    sourceType: 'module',
  });
}

export function transformJsUnknownFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions & AstTransformJsOptions & AstTransformJsxOptions,
): AstTransformResult {
  return transformJsFile(source, transforms, {
    ...options,
    // Determine whether module/script based on file contents
    sourceType: 'unambiguous',
  });
}

export function transformJsFile(
  source: string,
  transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>,
  options: AstTransformOptions &
    AstTransformJsOptions &
    AstTransformJsxOptions &
    Required<Pick<ParserOptions, 'sourceType'>>,
): AstTransformResult {
  const { filename, applyDangerousEdits, fs, jsx, sourceType, js: parserOptions = {} } = options;
  const defaultPlugins = jsx ? JSX_PARSER_PLUGINS : JS_PARSER_PLUGINS;
  // Attempt to determine input file line endings, defaulting to the operating system default
  const crlfLineEndings = source.includes('\r\n');
  const lfLineEndings = !crlfLineEndings && source.includes('\n');
  const lineTerminator = crlfLineEndings ? '\r\n' : lfLineEndings ? '\n' : undefined;
  // Parse the source AST
  const ast = parse(source, {
    parser: {
      sourceFilename: filename,
      parse(source: string): ReturnType<typeof parseAst> {
        const { plugins } = parserOptions;
        return parseAst(source, {
          ...parserOptions,
          sourceType,
          sourceFilename: filename,
          plugins: plugins ? [...defaultPlugins, ...plugins] : defaultPlugins,
          tokens: true,
        });
      },
    },
  }) as ReturnType<typeof parseAst>;
  // Transform the AST
  const uniqueErrors = new Map<string, SyntaxError>();
  const transformContext: AstTransformContext<AstCliContext> = {
    filename,
    opts: {
      applyDangerousEdits,
      warn(node: NodePath<AstNode> | null, message: string) {
        const error = node ? node.buildCodeFrameError(message) : new SyntaxError(message);
        uniqueErrors.set(error.message, error);
      },
      fail(node: NodePath<AstNode> | null, message: string) {
        const error = node ? node.buildCodeFrameError(message) : new SyntaxError(message);
        uniqueErrors.set(error.message, error);
      },
      fs,
    },
  };
  const transformedAst = transformAst(ast, transforms, transformContext, { source });
  // If there were no modifications to the AST, return a null result
  if (!transformedAst && uniqueErrors.size === 0) return { source: null, errors: [] };
  // Print the transformed AST
  const transformedSource = transformedAst
    ? print(transformedAst, {
        lineTerminator,
      }).code
    : null;
  // FIXME: differentiate between errors and warnings
  return {
    source: transformedSource === source ? null : transformedSource,
    errors: Array.from(uniqueErrors.values()),
  };
}
