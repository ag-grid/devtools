import template, { type TemplateBuilderOptions } from '@babel/template';
import { type AstNode, type Types } from './types';
import { node as t } from './node';

type Expression = Types.Expression;
type File = Types.File;
type Statement = Types.Statement;

const TEMPLATE_OPTIONS: TemplateBuilderOptions = {
  plugins: ['jsx', 'typescript', 'decorators-legacy'],
};

export function expression(
  literals: TemplateStringsArray,
  ...interpolations: Array<AstNode>
): Expression {
  return stripTopLevelExpressionParentheses(
    template.expression(TEMPLATE_OPTIONS).ast(literals, ...interpolations),
  );
}

export function statement(
  literals: TemplateStringsArray,
  ...interpolations: Array<AstNode>
): Statement {
  return template.statement(TEMPLATE_OPTIONS).ast(literals, ...interpolations);
}

export function statements(
  literals: TemplateStringsArray,
  ...interpolations: Array<AstNode>
): Array<Statement> {
  return template.statements(TEMPLATE_OPTIONS).ast(literals, ...interpolations);
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
