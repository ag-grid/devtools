import {
  parseAst,
  transformAst,
  type BabelPlugin,
  type BabelPluginWithOptions,
  type FileMetadata,
  type ParserOptions,
  type ParserPlugin,
} from '@ag-grid-devtools/ast';
import { parse, print } from 'recast';

export interface BabelTransformJsOptions {
  js?: Omit<ParserOptions, 'sourceFilename' | 'sourceType'>;
}

export interface BabelTransformJsxOptions {
  jsx: boolean;
}

const JS_PARSER_PLUGINS: Array<ParserPlugin> = ['typescript', 'decorators-legacy'];
const JSX_PARSER_PLUGINS: Array<ParserPlugin> = ['jsx', ...JS_PARSER_PLUGINS];

export function applyBabelTransform<S, T extends object = object>(
  source: string,
  plugins: Array<BabelPlugin<S> | BabelPluginWithOptions<S, T>>,
  context: FileMetadata &
    BabelTransformJsOptions &
    BabelTransformJsxOptions &
    Required<Pick<ParserOptions, 'sourceType'>>,
): string | null {
  const { filename, jsx, sourceType, js: parserOptions = {} } = context;
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
  const transformedAst = transformAst(ast, plugins, context, { source });
  // Print the transformed AST
  const transformedSource = transformedAst
    ? print(transformedAst, {
        lineTerminator,
      }).code
    : null;
  return transformedSource;
}
