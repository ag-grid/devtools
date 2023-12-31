import { nonNull, unreachable } from '@ag-grid-devtools/utils';
import {
  isBigIntLiteral,
  isBooleanLiteral,
  isDecimalLiteral,
  isIdentifier,
  isLiteral,
  isNullLiteral,
  isNumericLiteral,
  isPrivateName,
  isRegExpLiteral,
  isStringLiteral,
  isTemplateLiteral,
  NODE_FIELDS,
  VISITOR_KEYS,
  type Function,
  type Literal,
  type Expression,
  type Identifier,
  type NumericLiteral,
  type ObjectExpression,
  type ObjectMethod,
  type ObjectPattern,
  type ObjectProperty,
  type PrivateName,
  type RegExpLiteral,
  type StringLiteral,
  type TemplateElement,
  type TemplateLiteral,
} from '@babel/types';

import { AccessorKey, type AstNode, type LocatedAstNode, type NodePath } from './types';

export * as node from '@babel/types';

export function getLocatedPath(path: NodePath): NodePath<LocatedAstNode> | null {
  let locatedNode: NodePath<LocatedAstNode> | null = null;
  let current: NodePath | null = path;
  while (current) {
    if (current.node.loc) {
      locatedNode = current as NodePath<LocatedAstNode>;
      break;
    }
    current = current.parentPath;
  }
  return locatedNode;
}

export function getNodePropertyFieldNames<T extends AstNode>(node: T): Array<keyof T> {
  const childFields = VISITOR_KEYS[node.type];
  return Object.keys(NODE_FIELDS[node.type]).filter((key) => !childFields.includes(key)) as Array<
    keyof T
  >;
}

export function getOptionalNodeFieldValue<T>(
  path: NodePath<T | null | undefined>,
): NodePath<T> | null {
  if (path.node == null) return null;
  return path as NodePath<T>;
}

export function getNodeChildEntries<T extends AstNode>(
  path: NodePath<T>,
): Array<[keyof T, NodePath | Array<NodePath> | null]> {
  return VISITOR_KEYS[path.node.type].map((key) => {
    const propertyName = key as keyof T;
    const propertyValue = path.get(propertyName) as
      | NodePath<AstNode | null | undefined>
      | Array<NodePath>;
    const value = Array.isArray(propertyValue)
      ? propertyValue
      : getOptionalNodeFieldValue(propertyValue);
    return [propertyName, value];
  });
}

export function getAstNodeChildEntries<T extends AstNode>(
  node: T,
): Array<[keyof T, AstNode | Array<AstNode> | null]> {
  return VISITOR_KEYS[node.type].map((key) => {
    const propertyName = key as keyof T;
    const value = node[propertyName] as AstNode | Array<AstNode> | null | undefined;
    return [propertyName, value || null];
  });
}

export function getStaticPropertyKey(
  key: Expression | PrivateName,
  computed: boolean,
): string | null {
  if (!computed && isIdentifier(key)) return key.name;
  if (isLiteral(key)) return getLiteralPropertyKey(key);
  return null;
}

export function getLiteralPropertyKey(key: Literal): string | null {
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

export function getObjectLiteralStaticPropertyValues(
  object: NodePath<ObjectExpression>,
): Map<string, NodePath<Expression | ObjectMethod>> {
  return object
    .get('properties')
    .filter(
      (property): property is NodePath<ObjectProperty | ObjectMethod> =>
        property.isObjectProperty() || property.isObjectMethod(),
    )
    .map((property): [string, NodePath<ObjectProperty | ObjectMethod>] | null => {
      const key = property.get('key');
      const computed = property.node.computed;
      if (!computed && key.isIdentifier()) return [key.node.name, property];
      if (key.isLiteral()) {
        const propertyKey = getLiteralPropertyKey(key.node);
        if (!propertyKey) return null;
        return [propertyKey, property];
      }
      return null;
    })
    .filter(nonNull)
    .reduce((properties, [propertyKey, property]) => {
      if (property.isObjectMethod()) {
        properties.set(propertyKey, property);
      } else if (property.isObjectProperty()) {
        const value = property.get('value');
        if (value.isExpression()) {
          properties.set(propertyKey, value);
        } else {
          properties.delete(propertyKey);
        }
      }
      return properties;
    }, new Map<string, NodePath<Expression | ObjectMethod>>());
}

export function getNamedObjectLiteralStaticPropertyValue(
  object: NodePath<ObjectExpression>,
  propertyKey: string,
): NodePath<Expression | ObjectMethod> | null {
  const property = getNamedObjectLiteralStaticProperty(object, propertyKey);
  if (!property) return null;
  if (property.isObjectMethod()) {
    return property;
  }
  if (property.isObjectProperty()) {
    const value = property.get('value');
    return value.isExpression() ? value : null;
  }
  return null;
}

export function hasNamedObjectLiteralStaticProperty(
  object: NodePath<ObjectExpression | ObjectPattern>,
  propertyKey: string,
): boolean {
  return Boolean(getNamedObjectLiteralStaticProperty(object, propertyKey));
}

export function getNamedObjectLiteralStaticProperty(
  object: NodePath<ObjectExpression | ObjectPattern>,
  propertyKey: string,
): NodePath<ObjectProperty | ObjectMethod> | null {
  const matchedProperties = object
    .get('properties')
    .filter(
      (property): property is NodePath<ObjectProperty | ObjectMethod> =>
        property.isObjectProperty() || property.isObjectMethod(),
    )
    .filter((property) => {
      const key = property.get('key');
      const computed = property.node.computed;
      if (!computed && key.isIdentifier()) return key.node.name === propertyKey;
      if (key.isLiteral()) return getLiteralPropertyKey(key.node) === propertyKey;
      return false;
    });
  if (matchedProperties.length === 0) return null;
  const matchedProperty = matchedProperties[matchedProperties.length - 1];
  return matchedProperty;
}

export function getFunctionReturnValues(node: NodePath<Function>): Array<NodePath<Expression>> {
  const arrowFunctionBody = node.isArrowFunctionExpression() ? node.get('body') : null;
  if (arrowFunctionBody && arrowFunctionBody.isExpression()) return [arrowFunctionBody];
  const state = new Array<NodePath<Expression>>();
  node.traverse(
    {
      enter(path, state) {
        const isRootNode = path.node === node.node;
        if (isRootNode) return;
        const parentFunction = path.getFunctionParent();
        if (!parentFunction || parentFunction.node !== node.node) {
          // FIXME: ensure function return value child traversal does not skip parent traversal
          path.skip();
          return;
        }
        if (path.isReturnStatement()) {
          const returnedValue = getOptionalNodeFieldValue(path.get('argument'));
          if (returnedValue) state.push(returnedValue);
        }
      },
    },
    state,
  );
  return state;
}

export function parseStringExpressionValue(node: NodePath<Expression>): string | null {
  if (node.isStringLiteral()) return node.node.value;
  if (node.isTemplateLiteral()) return parseTemplateLiteralStringValue(node);
  return null;
}

function parseTemplateLiteralStringValue(node: NodePath<TemplateLiteral>): string | null {
  const literalSegments = node.node.quasis;
  const expressionSegments = node.node.expressions;
  if (expressionSegments.length > 0 || literalSegments.length !== 1) return null;
  const [literal] = literalSegments;
  return getTemplateLiteralQuasiSource(literal);
}

function getTemplateLiteralQuasiSource(literal: TemplateElement): string | null {
  if (typeof literal.value.cooked === 'string') return literal.value.cooked;
  return literal.value.raw;
}

export function createNamedPropertyKey(name: string): AccessorKey {
  return AccessorKey.Property({ name });
}

export function createStaticPropertyKey(property: Identifier, computed: false): AccessorKey;
export function createStaticPropertyKey(property: StringLiteral, computed: boolean): AccessorKey;
export function createStaticPropertyKey(property: PrivateName, computed: boolean): AccessorKey;
export function createStaticPropertyKey(property: NumericLiteral, computed: boolean): AccessorKey;
export function createStaticPropertyKey(
  property: Expression | PrivateName,
  computed: boolean,
): AccessorKey | null;
export function createStaticPropertyKey(
  property: Expression | PrivateName,
  computed: boolean,
): AccessorKey | null {
  if (isIdentifier(property) && !computed) {
    return AccessorKey.Property({ name: property.name });
  }
  if (isStringLiteral(property)) {
    return AccessorKey.Property({ name: property.value });
  }
  if (isPrivateName(property)) {
    return AccessorKey.PrivateField({ name: property.id.name });
  }
  if (isNumericLiteral(property)) {
    return AccessorKey.Index({ index: property.value });
  }
  return null;
}

export function createPropertyKey(
  property: NodePath<Expression | PrivateName>,
  computed: boolean,
): AccessorKey | null {
  if (property.isIdentifier() && !computed) {
    return AccessorKey.Property({ name: property.node.name });
  }
  if (property.isStringLiteral()) {
    return AccessorKey.Property({ name: property.node.value });
  }
  if (property.isPrivateName()) {
    return AccessorKey.PrivateField({ name: property.node.id.name });
  }
  if (property.isNumericLiteral()) {
    return AccessorKey.Index({ index: property.node.value });
  }
  if (computed && property.isExpression()) {
    return AccessorKey.Computed({ expression: property });
  }
  return null;
}

export function areLiteralsEqual(left: Literal, right: Literal): boolean {
  if (left === right) return true;
  if (isNullLiteral(left)) return isNullLiteral(right);
  if (isBooleanLiteral(left)) return isBooleanLiteral(right) && left.value === right.value;
  if (isStringLiteral(left)) return isStringLiteral(right) && left.value === right.value;
  if (isNumericLiteral(left)) return isNumericLiteral(right) && left.value === right.value;
  if (isBigIntLiteral(left)) return isBigIntLiteral(right) && left.value === right.value;
  if (isDecimalLiteral(left)) return isDecimalLiteral(right) && left.value === right.value;
  if (isRegExpLiteral(left)) {
    return isRegExpLiteral(right) && areRegExpLiteralsEqual(left, right);
  }
  if (isTemplateLiteral(left)) {
    return isTemplateLiteral(right) && areTemplateLiteralsEqual(left, right);
  }
  unreachable(left);

  function areRegExpLiteralsEqual(left: RegExpLiteral, right: RegExpLiteral): boolean {
    return left.pattern === right.pattern && left.flags === right.flags;
  }

  function areTemplateLiteralsEqual(left: TemplateLiteral, right: TemplateLiteral): boolean {
    return (
      left.quasis.length === right.quasis.length &&
      left.expressions.length === right.expressions.length &&
      left.quasis.every((leftQuasi, index) =>
        areTemplateElementsEqual(leftQuasi, right.quasis[index]),
      ) &&
      left.expressions.every((leftExpression, index) => {
        const rightExpression = right.expressions[index];
        if (leftExpression === rightExpression) return true;
        return (
          isLiteral(leftExpression) &&
          isLiteral(rightExpression) &&
          areLiteralsEqual(leftExpression, rightExpression)
        );
      })
    );
  }

  function areTemplateElementsEqual(left: TemplateElement, right: TemplateElement): boolean {
    return left.value.raw === right.value.raw;
  }
}
