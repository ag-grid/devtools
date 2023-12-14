import type { File, Node } from '@babel/types';

export type Ast = File;
export type AstNode = Node;
export type LocatedAstNode<T extends AstNode = AstNode> = T & { loc: NonNullable<T['loc']> };
