import { nonNull, unreachable } from '@ag-grid-devtools/utils';
import {
  ObjectMember,
  type Expression,
  type MemberExpression,
  type ObjectMethod,
  type ObjectProperty,
  type RestElement,
  type SpreadElement,
  PatternLike,
  TSParameterProperty,
  TSInstantiationExpression,
  TSAsExpression,
  TSSatisfiesExpression,
  TSTypeAssertion,
  TSNonNullExpression,
  LVal,
  OptionalMemberExpression,
  PrivateName,
} from '@babel/types';
import { type NodePath, type AstNode } from '../types';
import {
  PrimitiveValueType,
  TypeVariant,
  type ArrayType,
  type Type,
  type PrimitiveType,
  type ObjectType,
} from './types';
import { getStaticPropertyKey } from '../node';

type AstNodePath = NodePath<AstNode>;
type ExcludeNodeType<T extends NodePath<any>, V extends T['node']> = NodePath<
  Exclude<T['node'], V>
>;
type WithParentNodeType<T extends NodePath<any>, P extends T['parent']> = T & {
  parent: P;
  parentPath: NodePath<P>;
};

export function inferNodeTypes(
  typedNodes: Map<AstNodePath, Set<Type>>,
): Map<AstNodePath, Set<Type>> {
  const inferredNodes: Map<AstNodePath, Set<Type>> = new Map();
  const queue: Array<[AstNodePath, Type]> = Array.from(typedNodes.entries()).flatMap(
    ([node, types]) => Array.from(types).map((type) => withType(node, type)),
  );
  let next: [AstNodePath, Type] | undefined;
  while ((next = queue.pop())) {
    const [node, type] = next;
    const nodeTypes = getNodeTypes(node, inferredNodes);
    if (nodeTypes.has(type)) continue;
    nodeTypes.add(type);
    for (const reference of getReferences(node)) {
      if (hasNodeType(reference, type, inferredNodes)) continue;
      queue.push(withType(reference, type));
    }
    switch (type.type) {
      case TypeVariant.Primitive:
        queue.push(...inferPrimitiveNodeTypes(node, type));
        continue;
      case TypeVariant.Array:
        queue.push(...inferArrayNodeTypes(node, type));
        continue;
      case TypeVariant.Object:
        queue.push(...inferObjectNodeTypes(node, type));
        continue;
      case TypeVariant.Function:
        queue.push(...inferFunctionNodeTypes(node, type));
        continue;
      case TypeVariant.Union:
        queue.push(...inferUnionNodeTypes(node, type));
        continue;
    }
  }
  return inferredNodes;
}

function inferPrimitiveNodeTypes(
  node: AstNodePath,
  type: PrimitiveType<any>,
): Array<[AstNodePath, Type]> {
  return [];
}

function inferArrayNodeTypes<T extends Type>(
  node: AstNodePath,
  type: ArrayType<T>,
): Array<[AstNodePath, Type]> {
  if (node.isArrayExpression()) {
    return node
      .get('elements')
      .filter(isNonNullNode)
      .map((element) => {
        if (element.isSpreadElement()) {
          return withType(element.get('argument'), type);
        } else if (element.isExpression()) {
          return withType(element, type.element);
        } else {
          unreachableNode(element as ExcludeNodeType<typeof element, SpreadElement | Expression>);
        }
      });
  } else if (node.isArrayPattern()) {
    return node
      .get('elements')
      .filter(isNonNullNode)
      .map((element) => {
        if (element.isRestElement()) {
          return withType(element.get('argument'), type);
        } else if (element.isPatternLike() || element.isLVal()) {
          return withType(element, type.element);
        } else {
          unreachable(element);
        }
      });
  } else if (node.isObjectPattern()) {
    return node
      .get('properties')
      .map((property) => {
        if (property.isRestElement()) {
          return withType(property.get('argument'), type);
        } else if (property.isObjectProperty()) {
          const staticKey = getStaticPropertyKey(property.node.key, property.node.computed);
          if (staticKey !== 'length') return null;
          return withType(property.get('value'), {
            type: TypeVariant.Primitive,
            value: PrimitiveValueType.Number,
          });
        } else {
          unreachableNode(
            property as ExcludeNodeType<typeof property, RestElement | ObjectProperty>,
          );
        }
      })
      .filter(nonNull);
  } else {
    const parentNode = getNodeParent(node);
    if (
      parentNode &&
      parentNode.isMemberExpression() &&
      stripTypeScriptAnnotations(parentNode.get('object')) === node
    ) {
      const memberExpression = parentNode;
      const staticKey = getStaticPropertyKey(memberExpression.node.property, memberExpression.node.computed);
      if (Number.isInteger(Number(staticKey))) {
        return [[memberExpression, type.element]];
      } else if (staticKey === 'length') {
        return [[memberExpression, { type: TypeVariant.Primitive, value: PrimitiveValueType.Number }]];
      } else {
        return [];
      }
    } else {
      return [];
    }
  }
}

function inferObjectNodeTypes<P extends { [K in keyof P]: Type }>(
  node: AstNodePath,
  type: ObjectType<P>,
): Array<[AstNodePath, Type]> {
  if (node.isObjectExpression()) {
    return node
      .get('properties')
      .map((property, index, properties) => {
        if (property.isSpreadElement()) {
          const precedingStaticKeys = new Set(
            properties
              .slice(0, index)
              .map((node): PropertyKey | null =>
                node.isObjectMember() ? getStaticObjectMemberKey(node) : null,
              )
              .filter(nonNull),
          );
          const remainingFields = type.fields.filter(({ key }) => !precedingStaticKeys.has(key));
          return withType(property.get('argument'), {
            type: TypeVariant.Object,
            fields: remainingFields,
          });
        } else if (property.isObjectProperty()) {
          const staticKey = getStaticObjectMemberKey(property);
          const propertyType = type.fields.find(({ key }) => key === staticKey);
          if (!propertyType) return null;
          return withType(property.get('value'), propertyType.value);
        } else if (property.isObjectMethod()) {
          const staticKey = getStaticObjectMemberKey(property);
          const propertyType = type.fields.find(({ key }) => key === staticKey);
          if (!propertyType) return null;
          return withType(property, propertyType.value);
        } else {
          unreachableNode(
            property as ExcludeNodeType<
              typeof property,
              SpreadElement | ObjectProperty | ObjectMethod
            >,
          );
        }
      })
      .filter(nonNull);
  } else if (node.isObjectPattern()) {
    return node
      .get('properties')
      .map((property, index, properties) => {
        if (property.isRestElement()) {
          const precedingStaticKeys = new Set(
            properties
              .slice(0, index)
              .map((node): PropertyKey | null =>
                node.isObjectProperty() ? getStaticObjectMemberKey(node) : null,
              )
              .filter(nonNull),
          );
          const remainingFields = type.fields.filter(({ key }) => !precedingStaticKeys.has(key));
          return withType(property.get('argument'), {
            type: TypeVariant.Object,
            fields: remainingFields,
          });
        } else if (property.isObjectProperty()) {
          const staticKey = getStaticObjectMemberKey(property);
          const propertyType = type.fields.find(({ key }) => key === staticKey);
          if (!propertyType) return null;
          return withType(property.get('value'), propertyType.value);
        } else {
          unreachableNode(
            property as ExcludeNodeType<typeof property, RestElement | ObjectProperty>,
          );
        }
      })
      .filter(nonNull);
  } else {
    const parentNode = getNodeParent(node);
    if (
      parentNode &&
      parentNode.isMemberExpression() &&
      stripTypeScriptAnnotations(parentNode.get('object')) === node
    ) {
      const memberExpression = parentNode;
      const staticKey = getStaticPropertyKey(memberExpression.node.property, memberExpression.node.computed);
      if (staticKey !== null) {
        const propertyType = type.fields.find(({ key }) => key === staticKey);
        if (!propertyType) return [];
        return [withType(memberExpression, propertyType.value)];
      } else {
        return [];
      }
    } else {
      return [];
    }
  }
}

function getNodeParent(node: AstNodePath): AstNodePath | null {
  if (!node.parentPath) return null;
  if (isTsTypeWrapperNode(node.parentPath)) return getNodeParent(node.parentPath);
  return node.parentPath;
}

function getStaticObjectMemberKey(property: NodePath<ObjectMember>) {
  return getStaticPropertyKey(property.node.key, property.node.computed);
}

function getNodeTypes(node: AstNodePath, typedNodes: Map<AstNodePath, Set<Type>>): Set<Type> {
  const existingNodeTypes = typedNodes.get(node);
  const nodeTypes = existingNodeTypes || new Set();
  if (!existingNodeTypes) typedNodes.set(node, nodeTypes);
  return nodeTypes;
}

function hasNodeType(
  node: AstNodePath,
  type: Type,
  typedNodes: Map<AstNodePath, Set<Type>>,
): boolean {
  const existingNodeTypes = typedNodes.get(node);
  if (!existingNodeTypes) return false;
  return existingNodeTypes.has(type);
}
function withType(node: AstNodePath, type: Type): [AstNodePath, Type] {
  return [node, type];
}

function getReferences(node: AstNodePath): Array<AstNodePath> {
  return [];
}

function isNonNullNode<T extends AstNode>(node: NodePath<T | null>): node is NodePath<T> {
  return node.node !== null;
}

function unreachableNode(node: NodePath<never>): never {
  return unreachable(node.node);
}

function zip<L, R>(left: Array<L>, right: Array<R>): Array<[L, R]> {
  const length = Math.min(left.length, right.length);
  const results = new Array<[L, R]>(length);
  for (let i = 0; i < length; i++) {
    results[i] = [left[i], right[i]];
  }
  return results;
}

type TypeExpressionNode =
  | TSParameterProperty
  | TSInstantiationExpression
  | TSAsExpression
  | TSSatisfiesExpression
  | TSTypeAssertion
  | TSNonNullExpression;

export type TypeErased<T extends AstNode> = Exclude<T, TypeExpressionNode>;

function isTsTypeWrapperNode<T extends AstNode>(
  expression: NodePath<T>,
): expression is NodePath<Extract<T, TypeExpressionNode>> {
  return (
    expression.isTSParameterProperty() ||
    expression.isTSInstantiationExpression() ||
    expression.isTSAsExpression() ||
    expression.isTSSatisfiesExpression() ||
    expression.isTSTypeAssertion() ||
    expression.isTSNonNullExpression()
  );
}

export function stripTypeScriptAnnotations(
  expression: AstNodePath,
): NodePath<Exclude<AstNode, TypeExpressionNode>> {
  if (expression.isTSParameterProperty()) {
    return stripTypeScriptAnnotations(expression.get('parameter'));
  }
  if (expression.isTSInstantiationExpression()) {
    return stripTypeScriptAnnotations(expression.get('expression'));
  }
  if (expression.isTSAsExpression()) {
    return stripTypeScriptAnnotations(expression.get('expression'));
  }
  if (expression.isTSSatisfiesExpression()) {
    return stripTypeScriptAnnotations(expression.get('expression'));
  }
  if (expression.isTSTypeAssertion()) {
    return stripTypeScriptAnnotations(expression.get('expression'));
  }
  if (expression.isTSNonNullExpression()) {
    return stripTypeScriptAnnotations(expression.get('expression'));
  }
  return expression as ExcludeNodeType<
    typeof expression,
    | TSParameterProperty
    | TSInstantiationExpression
    | TSAsExpression
    | TSSatisfiesExpression
    | TSTypeAssertion
    | TSNonNullExpression
  >;
}
