import template, { type TemplateBuilderOptions } from '@babel/template';
import { type AstNode, type Types } from './types';
import { node as t } from './node';

type Expression = Types.Expression;
type File = Types.File;
type Statement = Types.Statement;

const TEMPLATE_OPTIONS: TemplateBuilderOptions = {
  plugins: ['jsx', 'typescript', 'decorators-legacy'],
};

export function expression<T extends Expression = Expression>(
  literals: TemplateStringsArray,
  ...interpolations: Array<AstNode | string>
): T {
  // If interpolations contains a string, we need to merge it with the literal and excluding it from the interpolations
  if (interpolations.some((interpolation) => typeof interpolation === 'string')) {
    const newRawLiterals: string[] = [];
    const newLiterals: string[] & { raw: string[] } = [] as any;
    newLiterals.raw = newRawLiterals;
    const newInterpolations: Array<AstNode> = [];

    let currentLiteral = literals[0];
    for (let i = 0; i < interpolations.length; i++) {
      const interpolation = interpolations[i];
      if (typeof interpolation === 'string') {
        currentLiteral += interpolation + literals[i + 1];
      } else {
        newRawLiterals.push(currentLiteral);
        newLiterals.push(currentLiteral);
        newInterpolations.push(interpolation);
        currentLiteral = literals[i + 1];
      }
    }
    newRawLiterals.push(currentLiteral);
    newLiterals.push(currentLiteral);

    literals = newLiterals;
    interpolations = newInterpolations;
  }

  return stripTopLevelExpressionParentheses(
    template.expression(TEMPLATE_OPTIONS).ast(literals, ...interpolations) as T,
  );
}

export function statement<T extends Statement = Statement>(
  literals: TemplateStringsArray,
  ...interpolations: Array<AstNode>
): T {
  return template.statement(TEMPLATE_OPTIONS).ast(literals, ...interpolations) as T;
}

export function statements<T extends Statement = Statement>(
  literals: TemplateStringsArray,
  ...interpolations: Array<AstNode>
): Array<T> {
  return template.statements(TEMPLATE_OPTIONS).ast(literals, ...interpolations) as Array<T>;
}

export function module(literals: TemplateStringsArray, ...interpolations: Array<AstNode>): File {
  return t.file(template.program(TEMPLATE_OPTIONS).ast(literals, ...interpolations));
}

function stripTopLevelExpressionParentheses<T extends Expression>(node: T): T {
  if (node.extra) {
    delete node.extra.parenthesized;
    delete node.extra.parenStart;
  }
  return node;
}
