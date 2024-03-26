import { nonNull, unreachable } from '@ag-grid-devtools/utils';
import type {
  ArgumentPlaceholder,
  ArrayExpression,
  AssignmentExpression,
  CallExpression,
  ClassAccessorProperty,
  ClassPrivateProperty,
  ClassProperty,
  Expression,
  Function,
  Identifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  JSXNamespacedName,
  MemberExpression,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty,
  OptionalMemberExpression,
  Pattern,
  RestElement,
  SpreadElement,
  StringLiteral,
  TSParameterProperty,
  VariableDeclarator,
} from '@babel/types';
import {
  AstPrimitiveValueType,
  AstTypeVariant,
  type AstAnyType,
  type AstArrayType,
  type AstFunctionType,
  type AstIntersectionType,
  type AstObjectType,
  type AstPrimitiveType,
  type AstTupleType,
  type AstType,
  type AstUnionType,
} from './types';
import { type NodePath, type AstNode } from '../types';
import { getReferences } from './scope';
import {
  getNodeParent,
  getStaticMemberExpressionKey,
  getStaticObjectMemberKey,
  isNonNullNode,
  isTsTypeWrapperNode,
  stripTsTypeWrapper,
  unreachableNode,
} from './utils';

type AstNodePath = NodePath<AstNode>;
type ExcludeNodeType<T extends NodePath<any>, V extends T['node']> = NodePath<
  Exclude<T['node'], V>
>;

export function inferAstTypes(
  typedNodes: Map<AstNodePath, Set<AstType>>,
): Map<AstNodePath, Set<AstType>> {
  const inferredNodes: Map<AstNodePath, Set<AstType>> = new Map();
  const queue: Array<[AstNodePath, AstType]> = Array.from(typedNodes.entries()).flatMap(
    ([node, types]) => Array.from(types).map((type) => withType(node, type)),
  );
  {
    let typedNode: [AstNodePath, AstType] | undefined;
    while ((typedNode = queue.pop())) {
      const [node, type] = typedNode;
      const nodeTypes = getNodeTypes(node, inferredNodes);
      if (nodeTypes.has(type)) continue;
      nodeTypes.add(type);
      for (const reference of getReferences(node)) {
        if (hasNodeType(reference, type, inferredNodes)) continue;
        queue.push(withType(reference, type));
      }
      for (const referencedNode of inferAdditionalNodeTypes(node, type)) {
        const [reference, type] = referencedNode;
        if (hasNodeType(reference, type, inferredNodes)) continue;
        queue.push(withType(reference, type));
      }
    }
  }
  return inferredNodes;
}

function inferAdditionalNodeTypes(node: AstNodePath, type: AstType): Array<[AstNodePath, AstType]> {
  if (isTsTypeWrapperNode(node)) return [withType(stripTsTypeWrapper(node), type)];
  const nodeTypes = inferAdditionalValueNodeTypes(node, type);
  const parentNode = getNodeParent(node);
  const grandparentNode = parentNode && getNodeParent(parentNode);
  if (parentNode?.isVariableDeclarator()) {
    return [
      ...nodeTypes,
      ...inferAdditionalVariableDeclaratorExpressionNodeTypes(parentNode, node, type),
    ];
  } else if (parentNode?.isAssignmentExpression()) {
    return [...nodeTypes, ...inferAdditionalAssignmentExpressionNodeTypes(parentNode, node, type)];
  } else if (parentNode?.isMemberExpression() || parentNode?.isOptionalMemberExpression()) {
    return [...nodeTypes, ...inferAdditionalMemberExpressionNodeTypes(parentNode, node, type)];
  } else if (parentNode?.isCallExpression()) {
    return [...nodeTypes, ...inferAdditionalCallExpressionNodeTypes(parentNode, node, type)];
  } else if (
    parentNode?.isClassProperty() ||
    parentNode?.isClassPrivateProperty() ||
    parentNode?.isClassAccessorProperty()
  ) {
    return [...nodeTypes, ...inferAdditionalClassPropertyNodeTypes(parentNode, node, type)];
  } else if (parentNode?.isImportDeclaration()) {
    return [...nodeTypes, ...inferAdditionalImportDeclarationNodeTypes(parentNode, node, type)];
  } else if (parentNode?.isArrayExpression() && node.isExpression()) {
    return [...nodeTypes, ...inferAdditionalArrayElementNodeTypes(parentNode, node, type)];
  } else if (parentNode?.isSpreadElement() && grandparentNode?.isArrayExpression()) {
    return [
      ...nodeTypes,
      ...inferAdditionalArraySpreadNodeTypes(grandparentNode, parentNode, node, type),
    ];
  } else if (parentNode?.isObjectProperty() && grandparentNode?.isObjectExpression()) {
    return [
      ...nodeTypes,
      ...inferAdditionalObjectPropertyNodeTypes(grandparentNode, parentNode, node, type),
    ];
  } else if (parentNode?.isObjectExpression() && node.isObjectMethod()) {
    return [...nodeTypes, ...inferAdditionalObjectMethodNodeTypes(parentNode, node, type)];
  } else if (parentNode?.isObjectExpression() && node.isSpreadElement()) {
    return [...nodeTypes, ...inferAdditionalObjectSpreadNodeTypes(parentNode, node, type)];
  } else {
    return nodeTypes;
  }
}

function inferAdditionalVariableDeclaratorExpressionNodeTypes(
  declaratorNode: NodePath<VariableDeclarator>,
  node: AstNodePath,
  type: AstType,
): Array<[AstNodePath, AstType]> {
  const id = declaratorNode.get('id');
  const init = declaratorNode.get('init');
  const left = stripTsTypeWrapper(id);
  const right = isNonNullNode(init) ? stripTsTypeWrapper(init) : null;
  return [
    ...(left !== node ? [withType(left, type)] : []),
    ...(right && right !== node ? [withType(right, type)] : []),
  ];
}

function inferAdditionalAssignmentExpressionNodeTypes(
  assignmentNode: NodePath<AssignmentExpression>,
  node: AstNodePath,
  type: AstType,
): Array<[AstNodePath, AstType]> {
  const left = stripTsTypeWrapper(assignmentNode.get('left'));
  const right = stripTsTypeWrapper(assignmentNode.get('right'));
  return [
    ...(left !== node ? [withType(left, type)] : []),
    ...(right !== node ? [withType(right, type)] : []),
  ];
}

function inferAdditionalMemberExpressionNodeTypes(
  memberNode: NodePath<MemberExpression | OptionalMemberExpression>,
  node: AstNodePath,
  type: AstType,
): Array<[AstNodePath, AstType]> {
  const object = stripTsTypeWrapper(memberNode.get('object'));
  if (object !== node) return [];
  const staticKey = getStaticMemberExpressionKey(memberNode);
  if (staticKey == null) return [];
  switch (type.type) {
    case AstTypeVariant.Object: {
      const propertyType = type.fields.find(({ key }) => key === staticKey);
      if (!propertyType) return [];
      return [withType(memberNode, propertyType.value)];
    }
    case AstTypeVariant.Array: {
      if (Number.isInteger(Number(staticKey))) {
        return [withType(memberNode, type.element)];
      } else if (staticKey === 'length') {
        return [
          withType(memberNode, { type: AstTypeVariant.Primitive, value: AstPrimitiveValueType.Number }),
        ];
      } else {
        return [];
      }
    }
    case AstTypeVariant.Tuple: {
      if (Number.isInteger(Number(staticKey))) {
        const index = Number(staticKey);
        if (index >= type.elements.length) return [];
        const element = type.elements[index];
        return [withType(memberNode, element)];
      } else if (staticKey === 'length') {
        return [
          withType(memberNode, { type: AstTypeVariant.Primitive, value: AstPrimitiveValueType.Number }),
        ];
      } else {
        return [];
      }
    }
    default: {
      return [];
    }
  }
}

function inferAdditionalCallExpressionNodeTypes(
  memberNode: NodePath<CallExpression>,
  node: AstNodePath,
  type: AstType,
): Array<[AstNodePath, AstType]> {
  const callee = stripTsTypeWrapper(memberNode.get('callee'));
  if (callee !== node) return [];
  switch (type.type) {
    case AstTypeVariant.Function: {
      const typedArgs = inferAdditionalCallExpressionArgNodeTypes(memberNode, type);
      const typedResult = withType(memberNode, type.result);
      return [...typedArgs, typedResult];
    }
    default: {
      return [];
    }
  }
}

function inferAdditionalCallExpressionArgNodeTypes<
  TArgs extends Array<AstType>,
  TRest extends AstType | null,
  TReturn extends AstType,
>(
  node: NodePath<CallExpression>,
  type: AstFunctionType<TArgs, TRest, TReturn>,
): Array<[AstNodePath, AstType]> {
  const args = node.get('arguments');
  const paramTypes = type.args.elements.slice();
  const restType = type.args.rest;
  return args.reduce(
    (acc, arg, index) => {
      const { typedNodes, paramTypes } = acc;
      if (arg.isArgumentPlaceholder() || arg.isJSXNamespacedName() || arg.isExpression()) {
        const paramType = paramTypes.shift() || restType;
        if (paramType) typedNodes.push(withType(arg, paramType));
      } else if (arg.isSpreadElement()) {
        typedNodes.push(
          withType(
            arg.get('argument'),
            index === 0
              ? type.args
              : {
                  type: AstTypeVariant.Tuple,
                  elements: paramTypes,
                  rest: restType,
                },
          ),
        );
      } else {
        unreachableNode(
          arg as ExcludeNodeType<
            typeof arg,
            ArgumentPlaceholder | JSXNamespacedName | Expression | SpreadElement
          >,
        );
      }
      return acc;
    },
    {
      typedNodes: new Array<[AstNodePath, AstType]>(),
      paramTypes,
    },
  ).typedNodes;
}

function inferAdditionalClassPropertyNodeTypes(
  propertyNode: NodePath<ClassProperty | ClassPrivateProperty | ClassAccessorProperty>,
  node: AstNodePath,
  type: AstType,
): Array<[AstNodePath, AstType]> {
  const key = propertyNode.get('key');
  if (key !== node) return [];
  const propertyValue = propertyNode.get('value');
  if (!isNonNullNode(propertyValue)) return [];
  const value = stripTsTypeWrapper(propertyValue);
  return [withType(value, type)];
}

function inferAdditionalImportDeclarationNodeTypes(
  importNode: NodePath<ImportDeclaration>,
  node: AstNodePath,
  type: AstType,
): Array<[AstNodePath, AstType]> {
  const source = importNode.get('source');
  if (source !== node) return [];
  return importNode.get('specifiers').flatMap((specifier) => {
    if (specifier.isImportSpecifier()) {
      const exportName = ((imported) => {
        if (imported.isIdentifier()) {
          return imported.node.name;
        } else if (imported.isStringLiteral()) {
          return imported.node.value;
        } else {
          unreachableNode(imported as ExcludeNodeType<typeof imported, Identifier | StringLiteral>);
        }
      })(specifier.get('imported'));
      const exportedTypes = (function getExportTypes(type): Array<AstType> {
        switch (type.type) {
          case AstTypeVariant.Union:
          case AstTypeVariant.Intersection: {
            return type.variants.flatMap((variant) => getExportTypes(variant));
          }
          case AstTypeVariant.Object: {
            const propertyType = type.fields.find(({ key }) => key === exportName);
            return propertyType ? [propertyType.value] : [];
          }
          default:
            return [];
        }
      })(type);
      return exportedTypes.map((exportedType) => withType(specifier.get('local'), exportedType));
    } else if (specifier.isImportDefaultSpecifier()) {
      const exportName = 'default';
      const exportTypes = (function getExportTypes(type): Array<AstType> {
        switch (type.type) {
          case AstTypeVariant.Union:
          case AstTypeVariant.Intersection: {
            return type.variants.flatMap((variant) => getExportTypes(variant));
          }
          case AstTypeVariant.Object: {
            const propertyType = type.fields.find(({ key }) => key === exportName);
            return propertyType ? [propertyType.value] : [];
          }
          default:
            return [];
        }
      })(type);
      return exportTypes.map((exportedType) => withType(specifier.get('local'), exportedType));
    } else if (specifier.isImportNamespaceSpecifier()) {
      return [withType(specifier.get('local'), type)];
    } else {
      unreachableNode(
        specifier as ExcludeNodeType<
          typeof specifier,
          ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
        >,
      );
    }
  });
}

function inferAdditionalObjectPropertyNodeTypes(
  objectNode: NodePath<ObjectExpression>,
  propertyNode: NodePath<ObjectProperty>,
  node: AstNodePath,
  type: AstType,
): Array<[AstNodePath, AstType]> {
  const value = stripTsTypeWrapper(propertyNode.get('value'));
  if (node !== value) return [];
  const staticKey = getStaticObjectMemberKey(propertyNode);
  if (staticKey == null) return [];
  return [
    withType(objectNode, {
      type: AstTypeVariant.Object,
      fields: [{ key: staticKey, value: type }],
      rest: null,
    }),
  ];
}

function inferAdditionalObjectMethodNodeTypes(
  objectNode: NodePath<ObjectExpression>,
  node: NodePath<ObjectMethod>,
  type: AstType,
): Array<[AstNodePath, AstType]> {
  const staticKey = getStaticObjectMemberKey(node);
  if (staticKey == null) return [];
  return [
    withType(objectNode, {
      type: AstTypeVariant.Object,
      fields: [{ key: staticKey, value: type }],
      rest: null,
    }),
  ];
}

function inferAdditionalObjectSpreadNodeTypes(
  objectNode: NodePath<ObjectExpression>,
  node: NodePath<SpreadElement>,
  type: AstType,
): Array<[AstNodePath, AstType]> {
  switch (type.type) {
    case AstTypeVariant.Object: {
      return [withType(objectNode, type)];
    }
    case AstTypeVariant.Array:
      return [
        withType(objectNode, {
          type: AstTypeVariant.Object,
          fields: [],
          rest: type.element,
        }),
      ];
    case AstTypeVariant.Tuple: {
      return [
        withType(objectNode, {
          type: AstTypeVariant.Object,
          fields: type.elements.map((element, index) => ({ key: Number(index), value: element })),
          rest: type.rest,
        }),
      ];
    }
    case AstTypeVariant.Union:
    case AstTypeVariant.Intersection: {
      return type.variants.flatMap((variant) =>
        inferAdditionalObjectSpreadNodeTypes(objectNode, node, variant),
      );
    }
    default: {
      return [];
    }
  }
}

function inferAdditionalArrayElementNodeTypes(
  arrayNode: NodePath<ArrayExpression>,
  node: NodePath<Expression>,
  type: AstType,
): Array<[AstNodePath, AstType]> {
  const elements = arrayNode.get('elements');
  const elementIndex = elements.findIndex((element) => {
    if (!isNonNullNode(element) || element.isSpreadElement()) return false;
    return element === node || stripTsTypeWrapper(element) === node;
  });
  if (elementIndex === -1 || elementIndex >= elements.length) return [];
  return [
    withType(arrayNode, {
      type: AstTypeVariant.Tuple,
      elements: elements.slice(elementIndex).map((_, index) =>
        index === elementIndex
          ? type
          : {
              type: AstTypeVariant.Any,
            },
      ),
      rest: null,
    }),
  ];
}

function inferAdditionalArraySpreadNodeTypes(
  arrayNode: NodePath<ArrayExpression>,
  spreadNode: NodePath<SpreadElement>,
  node: AstNodePath,
  type: AstType,
): Array<[AstNodePath, AstType]> {
  const argument = stripTsTypeWrapper(spreadNode.get('argument'));
  if (argument !== node) return [];
  const elements = arrayNode.get('elements');
  const elementIndex = elements.findIndex((element) => element === spreadNode);
  if (elementIndex === -1 || elementIndex >= elements.length) return [];
  return [
    withType(
      arrayNode,
      elementIndex === 0
        ? {
            type: AstTypeVariant.Array,
            element: type,
          }
        : {
            type: AstTypeVariant.Tuple,
            elements: elements.slice(elementIndex).map((_, index) => ({
              type: AstTypeVariant.Any,
            })),
            rest: type,
          },
    ),
  ];
}

function inferAdditionalValueNodeTypes(node: AstNodePath, type: AstType): Array<[AstNodePath, AstType]> {
  switch (type.type) {
    case AstTypeVariant.Any:
      return inferAdditionalAnyNodeTypes(node, type);
    case AstTypeVariant.Primitive:
      return inferAdditionalPrimitiveNodeTypes(node, type);
    case AstTypeVariant.Array:
      return inferAdditionalArrayNodeTypes(node, type);
    case AstTypeVariant.Tuple:
      return inferAdditionalTupleNodeTypes(node, type);
    case AstTypeVariant.Object:
      return inferAdditionalObjectNodeTypes(node, type);
    case AstTypeVariant.Function:
      return inferAdditionalFunctionNodeTypes(node, type);
    case AstTypeVariant.Union:
      return inferAdditionalUnionNodeTypes(node, type);
    case AstTypeVariant.Intersection:
      return inferAdditionalIntersectionNodeTypes(node, type);
  }
}

function inferAdditionalAnyNodeTypes(node: AstNodePath, type: AstAnyType): Array<[AstNodePath, AstType]> {
  return [];
}

function inferAdditionalPrimitiveNodeTypes<V extends AstPrimitiveValueType>(
  node: AstNodePath,
  type: AstPrimitiveType<V>,
): Array<[AstNodePath, AstType]> {
  return [];
}

function inferAdditionalArrayNodeTypes<T extends AstType>(
  node: AstNodePath,
  type: AstArrayType<T>,
): Array<[AstNodePath, AstType]> {
  const elementType = type.element;
  if (node.isArrayExpression()) {
    const elements = node.get('elements');
    return elements.filter(isNonNullNode).map((element) => {
      if (element.isExpression()) {
        return withType(element, elementType);
      } else if (element.isSpreadElement()) {
        return withType(element.get('argument'), type);
      } else {
        unreachableNode(element as ExcludeNodeType<typeof element, SpreadElement | Expression>);
      }
    });
  } else if (node.isArrayPattern()) {
    const elements = node.get('elements');
    return elements.filter(isNonNullNode).map((element) => {
      if (element.isRestElement()) {
        return withType(element.get('argument'), type);
      } else if (element.isPatternLike() || element.isLVal()) {
        return withType(element, elementType);
      } else {
        unreachable(element);
      }
    });
  } else if (node.isObjectPattern()) {
    const properties = node.get('properties');
    return properties
      .map((property) => {
        if (property.isObjectProperty()) {
          const staticKey = getStaticObjectMemberKey(property);
          if (Number.isInteger(Number(staticKey))) {
            return withType(property.get('value'), elementType);
          } else if (staticKey === 'length') {
            return withType(property.get('value'), {
              type: AstTypeVariant.Primitive,
              value: AstPrimitiveValueType.Number,
            });
          } else {
            return null;
          }
        } else if (property.isRestElement()) {
          return withType(property.get('argument'), type);
        } else {
          unreachableNode(
            property as ExcludeNodeType<typeof property, ObjectProperty | RestElement>,
          );
        }
      })
      .filter(nonNull);
  } else {
    return [];
  }
}

function inferAdditionalObjectNodeTypes<
  P extends { [K in keyof P]: AstType },
  TRest extends AstType | null,
>(node: AstNodePath, type: AstObjectType<P, TRest>): Array<[AstNodePath, AstType]> {
  const fieldTypes = type.fields;
  const restType = type.rest;
  if (node.isObjectExpression()) {
    const properties = node.get('properties');
    return properties
      .map((property, index, properties) => {
        if (property.isObjectProperty()) {
          const staticKey = getStaticObjectMemberKey(property);
          const propertyType = fieldTypes.find(({ key }) => key === staticKey)?.value ?? restType;
          if (!propertyType) return null;
          return withType(property.get('value'), propertyType);
        } else if (property.isObjectMethod()) {
          const staticKey = getStaticObjectMemberKey(property);
          const propertyType = fieldTypes.find(({ key }) => key === staticKey)?.value ?? restType;
          if (!propertyType) return null;
          return withType(property, propertyType);
        } else if (property.isSpreadElement()) {
          const precedingStaticKeys = new Set(
            properties
              .slice(0, index)
              .map((node): PropertyKey | null =>
                node.isObjectMember() ? getStaticObjectMemberKey(node) : null,
              )
              .filter(nonNull),
          );
          return withType(property.get('argument'), {
            type: AstTypeVariant.Object,
            fields: fieldTypes.filter(({ key }) => !precedingStaticKeys.has(key)),
            rest: restType,
          });
        } else {
          unreachableNode(
            property as ExcludeNodeType<
              typeof property,
              ObjectProperty | ObjectMethod | SpreadElement
            >,
          );
        }
      })
      .filter(nonNull);
  } else if (node.isObjectPattern()) {
    const properties = node.get('properties');
    return properties
      .map((property, index, properties) => {
        if (property.isObjectProperty()) {
          const staticKey = getStaticObjectMemberKey(property);
          const propertyType = fieldTypes.find(({ key }) => key === staticKey)?.value ?? restType;
          if (!propertyType) return null;
          return withType(property.get('value'), propertyType);
        } else if (property.isRestElement()) {
          const precedingStaticKeys = new Set(
            properties
              .slice(0, index)
              .map((node): PropertyKey | null =>
                node.isObjectProperty() ? getStaticObjectMemberKey(node) : null,
              )
              .filter(nonNull),
          );
          return withType(property.get('argument'), {
            type: AstTypeVariant.Object,
            fields: fieldTypes.filter(({ key }) => !precedingStaticKeys.has(key)),
            rest: restType,
          });
        } else {
          unreachableNode(
            property as ExcludeNodeType<typeof property, ObjectProperty | RestElement>,
          );
        }
      })
      .filter(nonNull);
  } else {
    return [];
  }
}

function inferAdditionalTupleNodeTypes<T extends Array<AstType>, TRest extends AstType | null>(
  node: AstNodePath,
  type: AstTupleType<T, TRest>,
): Array<[AstNodePath, AstType]> {
  if (node.isArrayExpression()) {
    const elements = node.get('elements');
    return elements
      .map((element, index) => {
        const elementType = index >= type.elements.length ? type.rest : type.elements[index];
        if (!elementType) return null;
        if (!isNonNullNode(element)) return null;
        if (element.isExpression()) {
          return withType(element, elementType);
        } else if (element.isSpreadElement()) {
          return withType(element, {
            type: AstTypeVariant.Tuple,
            elements: type.elements.slice(index),
            rest: type.rest,
          });
        } else {
          unreachableNode(element as ExcludeNodeType<typeof element, Expression | SpreadElement>);
        }
      })
      .filter(nonNull);
  } else if (node.isArrayPattern()) {
    const elements = node.get('elements');
    return elements
      .map((element, index) => {
        const elementType = index >= type.elements.length ? type.rest : type.elements[index];
        if (!elementType) return null;
        if (!isNonNullNode(element)) return null;
        if (element.isRestElement()) {
          return withType(element.get('argument'), {
            type: AstTypeVariant.Tuple,
            elements: type.elements.slice(index),
            rest: type.rest,
          });
        } else if (element.isPatternLike() || element.isLVal()) {
          return withType(element, elementType);
        } else {
          unreachable(element);
        }
      })
      .filter(nonNull);
  } else if (node.isObjectPattern()) {
    const properties = node.get('properties');
    return properties
      .map((property) => {
        if (property.isObjectProperty()) {
          const staticKey = getStaticObjectMemberKey(property);
          if (Number.isInteger(Number(staticKey))) {
            const index = Number(staticKey);
            const elementType = index >= type.elements.length ? type.rest : type.elements[index];
            if (!elementType) return null;
            return withType(property.get('value'), elementType);
          } else if (staticKey === 'length') {
            return withType(property.get('value'), {
              type: AstTypeVariant.Primitive,
              value: AstPrimitiveValueType.Number,
            });
          } else {
            return null;
          }
        } else if (property.isRestElement()) {
          return withType(property.get('argument'), type);
        } else {
          unreachableNode(
            property as ExcludeNodeType<typeof property, ObjectProperty | RestElement>,
          );
        }
      })
      .filter(nonNull);
  } else {
    return [];
  }
}

function inferAdditionalFunctionNodeTypes<
  TArgs extends Array<AstType>,
  TRest extends AstType | null,
  TReturn extends AstType,
>(node: AstNodePath, type: AstFunctionType<TArgs, TRest, TReturn>): Array<[AstNodePath, AstType]> {
  if (node.isFunction()) {
    return [
      ...inferAdditionalFunctionArgNodeTypes(node, type),
      ...inferAdditionalFunctionReturnNodeTypes(node, type),
    ];
  } else {
    return [];
  }
}

function inferAdditionalFunctionArgNodeTypes<
  TArgs extends Array<AstType>,
  TRest extends AstType | null,
  TReturn extends AstType,
>(node: NodePath<Function>, type: AstFunctionType<TArgs, TRest, TReturn>): Array<[AstNodePath, AstType]> {
  const params = node.get('params');
  const paramTypes = type.args.elements.slice();
  const restType = type.args.rest;
  return params.reduce(
    (acc, param, index) => {
      const { typedNodes, paramTypes } = acc;
      if (param.isIdentifier() || param.isPattern() || param.isTSParameterProperty()) {
        const paramType = paramTypes.shift() || restType;
        if (paramType) typedNodes.push(withType(param, paramType));
      } else if (param.isRestElement()) {
        typedNodes.push(
          withType(
            param.get('argument'),
            index === 0
              ? type.args
              : {
                  type: AstTypeVariant.Tuple,
                  elements: paramTypes,
                  rest: restType,
                },
          ),
        );
      } else {
        unreachableNode(
          param as ExcludeNodeType<
            typeof param,
            Identifier | Pattern | RestElement | TSParameterProperty
          >,
        );
      }
      return acc;
    },
    {
      typedNodes: new Array<[AstNodePath, AstType]>(),
      paramTypes,
    },
  ).typedNodes;
}

function inferAdditionalFunctionReturnNodeTypes<
  TArgs extends Array<AstType>,
  TRest extends AstType | null,
  TReturn extends AstType,
>(node: NodePath<Function>, type: AstFunctionType<TArgs, TRest, TReturn>): Array<[AstNodePath, AstType]> {
  const { result: returnType } = type;
  const returnedValues = getFunctionReturnArguments(node);
  return returnedValues.map((value) => withType(value, returnType));
}

function getFunctionReturnArguments(node: NodePath<Function>): Array<NodePath<Expression>> {
  const body = node.get('body');
  if (node.isArrowFunctionExpression() && body.isExpression()) {
    return [body];
  } else {
    const results = new Array<NodePath<Expression>>();
    body.traverse({
      Function(path) {
        // Avoid descending into nested functions
        path.skip();
      },
      ReturnStatement(path) {
        const argument = path.get('argument');
        if (isNonNullNode(argument)) results.push(argument);
      },
    });
    return results;
  }
}

function inferAdditionalUnionNodeTypes<T extends AstType>(
  node: AstNodePath,
  type: AstUnionType<T>,
): Array<[AstNodePath, AstType]> {
  return type.variants.map((variant) => withType(node, variant));
}

function inferAdditionalIntersectionNodeTypes<T extends AstType>(
  node: AstNodePath,
  type: AstIntersectionType<T>,
): Array<[AstNodePath, AstType]> {
  return type.variants.map((variant) => withType(node, variant));
}

function getNodeTypes(node: AstNodePath, typedNodes: Map<AstNodePath, Set<AstType>>): Set<AstType> {
  const existingNodeTypes = typedNodes.get(node);
  const nodeTypes = existingNodeTypes || new Set();
  if (!existingNodeTypes) typedNodes.set(node, nodeTypes);
  return nodeTypes;
}

function hasNodeType(
  node: AstNodePath,
  type: AstType,
  typedNodes: Map<AstNodePath, Set<AstType>>,
): boolean {
  const existingNodeTypes = typedNodes.get(node);
  if (!existingNodeTypes) return false;
  return existingNodeTypes.has(type);
}

function withType<T extends AstType>(node: AstNodePath, type: T): [AstNodePath, T] {
  return [node, type];
}
