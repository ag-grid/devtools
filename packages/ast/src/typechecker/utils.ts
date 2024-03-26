import { unreachable } from '@ag-grid-devtools/utils';
import {
  isBigIntLiteral,
  isBooleanLiteral,
  isDecimalLiteral,
  isIdentifier,
  isLiteral,
  isNullLiteral,
  isNumericLiteral,
  isRegExpLiteral,
  isStringLiteral,
  isTemplateLiteral,
  type ClassMethod,
  type ClassPrivateMethod,
  type Expression,
  type Literal,
  type LVal,
  type MemberExpression,
  type ObjectMember,
  type ObjectProperty,
  type OptionalMemberExpression,
  type PatternLike,
  type PrivateName,
  type Property,
  type TSAsExpression,
  type TSInstantiationExpression,
  type TSNonNullExpression,
  type TSSatisfiesExpression,
  type TSTypeAssertion,
} from '@babel/types';
import { type NodePath, type AstNode } from '../types';

export type ExcludeNodeType<T extends NodePath<any>, V extends T['node']> = NodePath<
  Exclude<T['node'], V>
>;

export function isNonNullNode<T extends AstNode | null | undefined>(
  node: NodePath<T>,
): node is NodePath<NonNullable<T>> {
  return node.node !== null;
}

export function unreachableNode(node: NodePath<never>): never {
  return unreachable(node.node);
}

export function getNodeParent(node: NodePath): NodePath | null {
  if (!node.parentPath) return null;
  if (isTsTypeWrapperNode(node.parentPath)) return getNodeParent(node.parentPath);
  return node.parentPath;
}

export type ClassMember = ClassMethod | ClassPrivateMethod | Exclude<Property, ObjectProperty>;

export function isClassMember(node: NodePath): node is NodePath<ClassMember> {
  switch (node.type) {
    case 'ClassProperty':
    case 'ClassMethod':
    case 'ClassAccessorProperty':
    case 'ClassPrivateProperty':
    case 'ClassPrivateMethod':
      return true;
    default:
      return false;
  }
}

export function getStaticMemberExpressionKey(
  property: NodePath<MemberExpression | OptionalMemberExpression>,
) {
  return getStaticPropertyKey(property.get('property').node, property.node.computed);
}

export function getStaticObjectMemberKey(member: NodePath<ObjectMember>) {
  return getStaticPropertyKey(member.get('key').node, member.node.computed);
}

export function getStaticClassMemberKey(member: NodePath<ClassMember>) {
  const computed = ((node) => {
    switch (node.type) {
      case 'ClassProperty':
      case 'ClassMethod':
      case 'ClassAccessorProperty': {
        const { computed } = node;
        return computed;
      }
      case 'ClassPrivateProperty':
      case 'ClassPrivateMethod':
        return false;
    }
  })(member.node);
  return getStaticPropertyKey(member.get('key').node, computed);
}

export function getStaticPropertyKey(
  key: Expression | PrivateName,
  computed: boolean,
): string | null {
  if (!computed && isIdentifier(key)) return key.name;
  if (isLiteral(key)) return getLiteralPropertyKey(key);
  return null;
}

function getLiteralPropertyKey(key: Literal): string | null {
  if (isStringLiteral(key)) return key.value;
  if (isNumericLiteral(key)) return String(key.value);
  if (isNullLiteral(key)) return String(null);
  if (isBooleanLiteral(key)) return String(key.value);
  if (isBigIntLiteral(key)) return String(key.value);
  if (isDecimalLiteral(key)) return String(key.value);
  if (isRegExpLiteral(key)) return null;
  if (isTemplateLiteral(key)) return null;
  return null;
}

export type TsTypeWrapperNode =
  | TSInstantiationExpression
  | TSAsExpression
  | TSSatisfiesExpression
  | TSTypeAssertion
  | TSNonNullExpression;

export function isTsTypeWrapperNode<T extends AstNode>(
  expression: NodePath<T>,
): expression is NodePath<Extract<T, TsTypeWrapperNode>> {
  return (
    expression.isTSInstantiationExpression() ||
    expression.isTSAsExpression() ||
    expression.isTSSatisfiesExpression() ||
    expression.isTSTypeAssertion() ||
    expression.isTSNonNullExpression()
  );
}

export function stripTsTypeWrapper(
  expression: NodePath<PatternLike>,
): NodePath<Exclude<PatternLike, TsTypeWrapperNode>>;
export function stripTsTypeWrapper(
  expression: NodePath<LVal>,
): NodePath<Exclude<LVal, TsTypeWrapperNode>>;
export function stripTsTypeWrapper(
  expression: NodePath<Expression>,
): NodePath<Exclude<Expression, TsTypeWrapperNode>>;
export function stripTsTypeWrapper(
  expression: NodePath<AstNode>,
): NodePath<Exclude<AstNode, TsTypeWrapperNode>>;
export function stripTsTypeWrapper(
  expression: NodePath<AstNode>,
): NodePath<Exclude<AstNode, TsTypeWrapperNode>> {
  if (expression.isTSInstantiationExpression()) {
    return stripTsTypeWrapper(expression.get('expression'));
  }
  if (expression.isTSAsExpression()) {
    return stripTsTypeWrapper(expression.get('expression'));
  }
  if (expression.isTSSatisfiesExpression()) {
    return stripTsTypeWrapper(expression.get('expression'));
  }
  if (expression.isTSTypeAssertion()) {
    return stripTsTypeWrapper(expression.get('expression'));
  }
  if (expression.isTSNonNullExpression()) {
    return stripTsTypeWrapper(expression.get('expression'));
  }
  return expression as ExcludeNodeType<
    typeof expression,
    | TSInstantiationExpression
    | TSAsExpression
    | TSSatisfiesExpression
    | TSTypeAssertion
    | TSNonNullExpression
  >;
}
