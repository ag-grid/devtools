import { Node } from '@ag-grid-devtools/ast';
import j, { JSXAttribute, ObjectProperty, ASTPath } from 'jscodeshift';

export const isJSXAttribute = (
  path: ASTPath<JSXAttribute | ObjectProperty>,
): path is ASTPath<JSXAttribute> => path.value.type === 'JSXAttribute';

export const getValueFromNode = (node: Node) => {
  if (!node) {
    // when in React, value can be omitted to mean true
    return j.booleanLiteral(true);
  }
  if ('value' in node) {
    const value = node.value;
    if (value && 'expression' in value) {
      return value.expression;
    }
    return node.value;
  }

  return j.booleanLiteral(true);
};

export const wrapValue = (path: ASTPath<JSXAttribute | ObjectProperty>, node: Node) => {
  if (isJSXAttribute(path)) {
    if (!node) {
      return undefined;
    }
    if ('value' in node) {
      if (node.type === 'StringLiteral') {
        return node;
      }
      if (node.value === true) {
        return undefined;
      }
    }
    return j.jsxExpressionContainer(node);
  }
  return node;
};

export const getKeyValueNode = <T extends JSXAttribute | ObjectProperty>(
  path: ASTPath<T>,
  name: string,
  value: Node,
): T extends JSXAttribute ? JSXAttribute | undefined : ObjectProperty | undefined => {
  // if value false, omit property
  if (value?.value === false) {
    return undefined;
  }

  if (isJSXAttribute(path)) {
    const wrapped = wrapValue(path, value);
    if (wrapped) {
      return j.jsxAttribute(j.jsxIdentifier(name), wrapped);
    }
    return j.jsxAttribute(j.jsxIdentifier(name));
  }
  return j.objectProperty(j.identifier(name), value);
};

const getSiblings = <T extends JSXAttribute | ObjectProperty>(path: ASTPath<T>): T[] => {
  if (path.node.type === 'JSXAttribute') {
    return path.parent.value.attributes as T[];
  }
  return path.parent.value.properties as T[];
};

export const getSibling = <T extends JSXAttribute | ObjectProperty>(
  path: ASTPath<T>,
  name: string,
): T | undefined => {
  if (path.node.type === 'JSXAttribute') {
    return getSiblings<JSXAttribute>(path).find(
      (child: T) => child && child.name.type === 'JSXIdentifier' && child.name.name === name,
    );
  }
  return getSiblings<ObjectProperty>(path).find(
    (child: T) => child && child.key.type === 'Identifier' && child.key.name === name,
  );
};

export const createTernary = (condition: Node, consequent: Node, alternate: Node) => {
  if (!condition) {
    return consequent;
  }
  if (condition.value === true) {
    return consequent;
  }
  if (condition.value === false) {
    return alternate;
  }
  return j.conditionalExpression(condition, consequent, alternate);
};

export const createLogicalOr = (left: Node, right: Node) => {
  if (left.type === 'BooleanLiteral') {
    if (left.value === true) {
      return left;
    }
    return right;
  }
  if (left.type === 'StringLiteral' && left.value) {
    return left;
  }
  return j.logicalExpression('||', left, right);
};

export const createLogicalAnd = (left: Node, right: Node) => {
  if (left.type === 'BooleanLiteral' && left.value === false) {
    return j.booleanLiteral(false);
  }
  if (right.type === 'BooleanLiteral' && right.value === false) {
    return j.booleanLiteral(false);
  }
  return j.logicalExpression('&&', left, right);
};
