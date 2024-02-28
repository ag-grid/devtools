import {
  parseAst,
  transformAst,
  type BabelPlugin,
  type BabelPluginWithOptions,
  type FileMetadata,
  type ParserOptions,
  type ParserPlugin,
} from '@ag-grid-devtools/ast';
import { parse, print, type Options } from 'recast';

export interface BabelTransformJsOptions {
  js?: Omit<ParserOptions, 'sourceFilename' | 'sourceType'>;
}

export interface BabelTransformJsxOptions {
  jsx: boolean;
}

const JS_PARSER_PLUGINS: Array<ParserPlugin> = ['typescript', 'decorators-legacy'];
const JSX_PARSER_PLUGINS: Array<ParserPlugin> = ['jsx', ...JS_PARSER_PLUGINS];

export function createBabelPlugin<S>(plugin: BabelPlugin<S>): BabelPlugin<S> {
  // No-op function that exists to provide type hints when create a Babel plugin from untyped code
  return plugin;
}

export function applyBabelTransform<S, T extends object = object>(
  source: string,
  plugins: Array<BabelPlugin<S> | BabelPluginWithOptions<S, T>>,
  context: FileMetadata &
    BabelTransformJsOptions &
    BabelTransformJsxOptions &
    Required<Pick<ParserOptions, 'sourceType'>> & {
      print?: Options;
    },
): string | null {
  const { print: printOptions = {}, ...parserContext } = context;
  // Attempt to determine input file line endings, defaulting to the operating system default
  const crlfLineEndings = source.includes('\r\n');
  const lfLineEndings = !crlfLineEndings && source.includes('\n');
  const lineTerminator = crlfLineEndings ? '\r\n' : lfLineEndings ? '\n' : undefined;
  // Parse the source AST
  const ast = parseBabelAst(source, parserContext);
  // Transform the AST
  const transformedAst = transformAst(ast, plugins, parserContext, { source });
  // Print the transformed AST
  const transformedSource = transformedAst
    ? print(transformedAst, {
        lineTerminator,
        ...printOptions,
      }).code
    : null;
  return transformedSource;
}

export function parseBabelAst<S, T extends object = object>(
  source: string,
  context: FileMetadata &
    BabelTransformJsOptions &
    BabelTransformJsxOptions &
    Required<Pick<ParserOptions, 'sourceType'>>,
): ReturnType<typeof parseAst> {
  const { filename, jsx, sourceType, js: parserOptions = {} } = context;
  const defaultPlugins = jsx ? JSX_PARSER_PLUGINS : JS_PARSER_PLUGINS;
  return parse(source, {
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
}
