import { AstNode } from '@ag-grid-devtools/ast';
import {
  format,
  resolveConfig,
  type Options,
  type ParserOptions,
  type Plugin,
  type ResolveConfigOptions,
} from 'prettier';

const PRETTIER_AST_NODE_PARSER_NAME = 'ast-node';

export function applyPrettierFormat(source: string, config: Options): Promise<string> {
  return format(source, config);
}

export function loadPrettierConfig(
  currentPath: string,
  options?: ResolveConfigOptions,
): Promise<Options | null> {
  return resolveConfig(currentPath, options);
}

export function printPrettierAstNode(
  /**
   * Input node must be in ESTree format, which differs slightly from the Babel AST format.
   * Note that this can be specified when parsing Babel source by specifying the `"estree"` parser
   * plugin, however this will yield an AST which is not 100% compatible with Babel transforms
   * (e.g. prettier will assume literal values are exposed as `node.extra.raw` rather than `node.raw`)
   * @see https://babeljs.io/docs/babel-parser#output
   * @see https://github.com/babel/babel/blob/main/packages/babel-parser/src/plugins/estree.ts
   * */
  node: AstNode,
  config: Options & Pick<ParserOptions, 'originalText'>,
): Promise<string> {
  // See https://github.com/prettier/prettier/issues/5998#issuecomment-600933341
  return format(config.originalText, {
    ...config,
    parser: PRETTIER_AST_NODE_PARSER_NAME,
    plugins: [createPrettierAstNodeParserPlugin(node)],
  });
}

function createPrettierAstNodeParserPlugin(ast: AstNode): Plugin<AstNode> {
  return {
    parsers: {
      [PRETTIER_AST_NODE_PARSER_NAME]: {
        parse(text, options) {
          return ast;
        },
        astFormat: 'estree',
        locStart(node) {
          return node.loc?.start.index ?? 0;
        },
        locEnd(node) {
          return node.loc?.end.index ?? 0;
        },
      },
    },
  };
}
