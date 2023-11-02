import { expect, test } from 'vitest';

import { matchNode } from './matcher';
import * as ast from './ast';
import { getModuleRoot, NodePath } from './parse';
import { type Types } from './types';

type Statement = Types.Statement;

test('exposes a top-level matcher function', () => {
  expect(matchNode).toBeInstanceOf(Function);
});

test('basic expression matching', () => {
  const input = ast.module`foo.bar = baz;`;
  const program = getModuleRoot(input);
  const statements = program.get('body');
  const firstStatement: NodePath<Statement> = statements[0];
  firstStatement.assertExpressionStatement();
  const expression = firstStatement.get('expression');
  {
    const matcher = matchNode(({}) => ast.expression`foo.bar = baz`, {});
    const result = matcher.match(expression);
    expect(result).toEqual({});
  }
  {
    const matcher = matchNode(({}) => ast.expression`foo.bar = qux`, {});
    const result = matcher.match(expression);
    expect(result).toBeNull();
  }
});
