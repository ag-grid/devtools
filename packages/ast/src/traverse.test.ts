import { describe, expect, test } from 'vitest';
import { type NumericLiteral, type Program } from '@babel/types';

import { ast, node as t, type NodePath } from '../lib';

import { findAstNode } from './traverse';

describe(findAstNode, () => {
  test('finds root nodes', () => {
    const input = ast.module`3;`;
    const predicate = (path: NodePath): path is NodePath<Program> => path.isProgram();
    const actual = findAstNode(input, predicate);
    expect(actual && actual.node).toBe(input.program);
  });

  test('finds individual nodes', () => {
    const target = t.numericLiteral(4);
    const input = ast.module`3; ${target}; 5;`;
    const predicate = (path: NodePath): path is NodePath<NumericLiteral> =>
      path.isNumericLiteral() && path.node.value === 4;
    const actual = findAstNode(input, predicate);
    expect(actual && actual.node).toBe(target);
  });

  test('returns a single result when multiple potential matches are present', () => {
    const first = t.numericLiteral(4);
    const second = t.numericLiteral(4);
    const input = ast.module`3; ${first}; ${second}; 5;`;
    const predicate = (path: NodePath): path is NodePath<NumericLiteral> =>
      path.isNumericLiteral() && path.node.value === 4;
    const actual = findAstNode(input, predicate);
    expect(actual && actual.node).toBe(first);
    expect(actual && actual.node).not.toBe(second);
  });

  test('returns null when no matches are found', () => {
    const input = ast.module`3; 4; 5;`;
    const predicate = (path: NodePath): path is NodePath<NumericLiteral> =>
      path.isNumericLiteral() && path.node.value === 6;
    const actual = findAstNode(input, predicate);
    expect(actual).toBeNull();
  });
});
