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
import { partition } from '@ag-grid-devtools/utils';
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
  const uniqueErrors = new Map<string, { fatal: boolean; error: SyntaxError }>();
  const transformContext: AstTransformContext<AstCliContext> = {
    filename,
    opts: {
      applyDangerousEdits,
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
  const transformedAst = transformAst(ast, transforms, transformContext, { source });
  // If there were no modifications to the AST, return a null result
  if (!transformedAst && uniqueErrors.size === 0) return { source: null, errors: [], warnings: [] };
  // Print the transformed AST
  const transformedSource = transformedAst
    ? print(transformedAst, {
        lineTerminator,
      }).code
    : null;
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
