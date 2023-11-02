import { parse, type ParseResult, type ParserOptions } from '@babel/parser';
import { type File, type Program } from '@babel/types';
import { default as traverse, type NodePath } from '@babel/traverse';

export type * from '@babel/parser';
export type * from '@babel/traverse';

export { default as traverse } from '@babel/traverse';

export function parseAst(input: string, options?: ParserOptions): ParseResult<File> {
  return parse(input, options);
}

export function getModuleRoot(source: File): NodePath<Program> {
  let root: NodePath<Program>;
  traverse(source, {
    Program(path) {
      root = path;
    },
  });
  return root!;
}
