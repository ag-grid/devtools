import generator, { type GeneratorOptions } from '@babel/generator';

import { AstNode } from './types';

export type * from '@babel/generator';

export function generate(node: AstNode, options?: GeneratorOptions): string {
  return generator(node, options).code;
}
