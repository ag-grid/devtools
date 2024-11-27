import {
  parseAst,
  transformAst,
  traverse,
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
  const { ast, quoteStyle } = parseBabelAst(source, parserContext);

  // Transform the AST
  const transformedAst = transformAst(ast, plugins, parserContext, { source });
  // Print the transformed AST
  let transformedSource = transformedAst
    ? print(transformedAst, {
        lineTerminator,
        ...printOptions,
        quote: quoteStyle,
      }).code
    : null;

  if (transformedSource) {
    // HACK: Remove double semicolons on directives, it seems recast and babel are inserting them by mistake?
    if (transformedSource.includes(';;')) {
      transformedSource = transformedSource
        .replace(/^'use strict';;$/gm, "'use strict';")
        .replace(/^"use strict";;$/gm, '"use strict";')
        .replace(/^'use client';;$/gm, "'use client';")
        .replace(/^"use client";;$/gm, '"use client";');
    }
  }

  return transformedSource;
}

export function parseBabelAst<S, T extends object = object>(
  source: string,
  context: FileMetadata &
    BabelTransformJsOptions &
    BabelTransformJsxOptions &
    Required<Pick<ParserOptions, 'sourceType'>>,
): {
  quoteStyle: 'single' | 'double' | 'auto';
  ast: ReturnType<typeof parseAst>;
} {
  let singleQuoteCount = 0;
  let doubleQuoteCount = 0;

  const { filename, jsx, sourceType, js: parserOptions = {} } = context;
  const defaultPlugins = jsx ? JSX_PARSER_PLUGINS : JS_PARSER_PLUGINS;
  const result = parse(source, {
    parser: {
      sourceFilename: filename,
      parse(source: string): ReturnType<typeof parseAst> {
        const { plugins } = parserOptions;
        const babelResult = parseAst(source, {
          ...parserOptions,
          sourceType,
          sourceFilename: filename,
          plugins: plugins ? [...defaultPlugins, ...plugins] : defaultPlugins,
          tokens: true,
        });

        // Count single quotes strings and double quote strings from the ast using babel traverse
        traverse(babelResult, {
          StringLiteral(path) {
            const rawString = path.node.extra?.raw;
            if (typeof rawString === 'string') {
              if (rawString.startsWith?.('"')) {
                doubleQuoteCount++;
              } else {
                singleQuoteCount++;
              }
            }
          },
        });

        return babelResult;
      },
    },
  }) as ReturnType<typeof parseAst>;

  return {
    quoteStyle:
      singleQuoteCount === doubleQuoteCount
        ? 'auto'
        : singleQuoteCount > doubleQuoteCount
          ? 'single'
          : 'double',
    ast: result,
  };
}
