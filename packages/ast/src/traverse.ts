import { traverse, type NodePath } from '@babel/core';
import { type AstNode } from './types';

export function findAstNode<T extends AstNode>(
  root: AstNode,
  predicate: (node: NodePath<AstNode>) => node is NodePath<T>,
): NodePath<T> | null;
export function findAstNode(
  root: AstNode,
  predicate: (node: NodePath<AstNode>) => boolean,
): NodePath<AstNode> | null;
export function findAstNode(
  root: AstNode,
  predicate: (node: NodePath<AstNode>) => boolean,
): NodePath<AstNode> | null {
  let result: NodePath<AstNode> | null = null;
  traverse(root, {
    enter(path) {
      if (predicate(path)) {
        result = path;
        path.stop();
      }
    },
  });
  return result;
}
