import { node as t } from '../node';
import { createPatternPlaceholder, createTypedPlaceholder } from '../pattern';
import { type AstNodeMatcher, type ExpressionPattern, type NodePath, type Types } from '../types';

type Expression = Types.Expression;

export function expression(): ExpressionPattern {
  const placeholder = createTypedPlaceholder('Expression', t.identifier('_'));
  const matcher = matchExpression();
  return createPatternPlaceholder(placeholder, matcher);
}

export function matchExpression(): AstNodeMatcher<Expression> {
  return (path: NodePath): path is NodePath<Expression> => {
    if (!path.isExpression()) return false;
    return true;
  };
}
