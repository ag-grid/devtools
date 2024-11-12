import { Node, NodePath } from '@ag-grid-devtools/ast';
import * as t from '@babel/types';

export function isIdentifierPath(path?: NodePath): path is NodePath<t.Identifier> {
  return isIdentifierNode(path?.node);
}

export function isIdentifierNode(node?: Node): node is t.Identifier {
  return node?.type === 'Identifier';
}

export function isObjectExpressionPath(path?: NodePath): path is NodePath<t.ObjectExpression> {
  return isObjectExpressionNode(path?.node);
}

export function isObjectExpressionNode(node?: Node): node is t.ObjectExpression {
  return node?.type === 'ObjectExpression';
}

export function isObjectPropertyPath(path?: NodePath): path is NodePath<t.ObjectProperty> {
  return isObjectPropertyNode(path?.node);
}

export function isObjectPropertyNode(node?: Node): node is t.ObjectProperty {
  return node?.type === 'ObjectProperty';
}

export function isStringLiteralPath(path?: NodePath): path is NodePath<t.StringLiteral> {
  return isStringLiteralNode(path?.node);
}

export function isStringLiteralNode(node?: Node): node is t.StringLiteral {
  return node?.type === 'StringLiteral';
}
