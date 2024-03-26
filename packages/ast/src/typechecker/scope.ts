import type {
  AssignmentPattern,
  Class,
  ClassAccessorProperty,
  ClassMethod,
  ClassPrivateMethod,
  ClassPrivateProperty,
  ClassProperty,
  Expression,
  FunctionDeclaration,
  Identifier,
  LVal,
  MemberExpression,
  ObjectExpression,
  ObjectMember,
  ObjectMethod,
  ObjectProperty,
  OptionalMemberExpression,
  PrivateName,
  Property,
  RestElement,
  SpreadElement,
  StaticBlock,
  Super,
  TSDeclareMethod,
  TSIndexSignature,
  TSParameterProperty,
  ThisExpression,
} from '@babel/types';
import { type NodePath, type AstNode, type Binding, Scope } from '../types';
import {
  ClassMember,
  getNodeParent,
  getStaticClassMemberKey,
  getStaticMemberExpressionKey,
  getStaticObjectMemberKey,
  getStaticPropertyKey,
  isClassMember,
  isNonNullNode,
  isTsTypeWrapperNode,
  stripTsTypeWrapper,
  unreachableNode,
} from './utils';
import { nonNull } from '@ag-grid-devtools/utils';

type AstNodePath = NodePath<AstNode>;
type ExcludeNodeType<T extends NodePath<any>, V extends T['node']> = NodePath<
  Exclude<T['node'], V>
>;

export function getReferences(node: AstNodePath): Array<AstNodePath> {
  if (isTsTypeWrapperNode(node)) {
    const expression = stripTsTypeWrapper(node);
    return [expression, ...getReferences(expression)];
  } else if (node.isIdentifier() && isVariableReference(node)) {
    const computed = false;
    return getVariableReferences(node.scope, node, computed);
  } else if (node.isMemberExpression() || node.isOptionalMemberExpression()) {
    return getMemberExpressionReferences(node);
  } else if (
    isClassMember(node) &&
    node.parentPath.isClassBody() &&
    node.parentPath.parentPath.isClass()
  ) {
    return getClassMemberReferences(node.parentPath.parentPath, node);
  } else if (node.isObjectMember() && node.parentPath.isObjectExpression()) {
    return getObjectMemberReferences(node.parentPath, node);
  } else if (
    node.isTSParameterProperty() &&
    node.parentPath.isClassMethod() &&
    node.parentPath.parentPath.isClassBody() &&
    node.parentPath.parentPath.parentPath.isClass()
  ) {
    return getClassConstructorParameterPropertyReferences(
      node.parentPath.parentPath.parentPath,
      node,
    );
  } else {
    return [];
  }
}

function isVariableReference(node: NodePath<Identifier>): boolean {
  if (isLocalVariableReference(node)) return true;
  if (isDestructuredVariableReference(node)) return true;
  return false;
}

function isLocalVariableReference(node: NodePath<Identifier>): boolean {
  return node.isExpression();
}

function isDestructuredVariableReference(node: NodePath<Identifier>): boolean {
  const parent = node.parentPath;
  if (parent.isArrayPattern()) {
    return true;
  } else if (parent.isObjectProperty()) {
    const grandparent = parent.parentPath;
    if (!grandparent) return false;
    if (grandparent.isObjectPattern()) {
      return node.node === parent.node.value;
    }
    return false;
  } else if (parent.isRestElement()) {
    const grandparent = parent.parentPath;
    if (!grandparent) return false;
    if (grandparent.isObjectPattern()) {
      return node.node === parent.node.argument;
    }
    return false;
  } else if (parent.isAssignmentPattern()) {
    const grandparent = parent.parentPath;
    if (!grandparent) return false;
    if (grandparent.isObjectPattern() || grandparent.isArrayPattern()) {
      return node.node === parent.node.left;
    }
    return false;
  } else {
    return false;
  }
}

function getVariableReferences(
  scope: Scope,
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): Array<NodePath<Identifier | FunctionDeclaration>> {
  // TODO: Retrieve references for variables with private/computed keys
  if (!key.isIdentifier() || computed) return [];
  const binding = scope.getBinding(key.node.name);
  if (!binding) return [];
  const declaration =
    key.isIdentifier() && !computed ? getBindingTargetReference(binding, key.node.name) : null;
  const accessors = binding.referencePaths
    .map((node) => (node.isIdentifier() ? node : null))
    .filter(nonNull);
  const assignments = binding.constantViolations
    .map((path) => {
      if (!path.isAssignmentExpression()) return null;
      const assignmentTarget = stripTsTypeWrapper(path.get('left'));
      if (assignmentTarget.isIdentifier() && assignmentTarget.node.name === key.node.name) {
        return assignmentTarget;
      }
      return null;
    })
    .filter(nonNull);
  return [...(declaration ? [declaration] : []), ...accessors, ...assignments].filter(
    (node) => node !== key,
  );
}

function getBindingTargetReference(
  binding: Binding,
  key: string,
): NodePath<Identifier | FunctionDeclaration> | null {
  switch (binding.kind) {
    case 'var':
    case 'let':
    case 'const': {
      if (!binding.path.isVariableDeclarator()) return null;
      const targetAccessor = binding.path.get('id');
      if (!targetAccessor.isPatternLike()) return null;
      return getDestructuringPatternVariableReference(targetAccessor, key);
    }
    case 'param':
    case 'local': {
      if (!binding.path.isPatternLike()) return null;
      return getDestructuringPatternVariableReference(binding.path, key);
    }
    case 'hoisted': {
      if (!binding.path.isFunctionDeclaration()) return null;
      return binding.path;
    }
    case 'module': {
      if (binding.path.isImportSpecifier()) {
        return binding.path.get('local');
      } else if (binding.path.isImportDefaultSpecifier()) {
        return binding.path.get('local');
      } else if (binding.path.isImportNamespaceSpecifier()) {
        return binding.path.get('local');
      } else {
        return null;
      }
    }
    case 'unknown':
      if (binding.path.isIdentifier()) return binding.path;
      return null;
  }
}

function getDestructuringPatternVariableReference(
  pattern: NodePath<LVal>,
  key: string,
): NodePath<Identifier> | null {
  if (pattern.isIdentifier()) {
    return pattern;
  } else if (pattern.isArrayPattern()) {
    return (
      pattern
        .get('elements')
        .filter(isNonNullNode)
        .map((node) => getDestructuringPatternVariableReference(node, key))
        .find(nonNull) ?? null
    );
  } else if (pattern.isObjectPattern()) {
    return (
      pattern
        .get('properties')
        .map((node) => {
          if (node.isObjectProperty()) {
            const value = node.get('value');
            if (!value.isPatternLike()) return null;
            return getDestructuringPatternVariableReference(value, key);
          } else if (node.isRestElement()) {
            return getDestructuringPatternVariableReference(node.get('argument'), key);
          } else {
            unreachableNode(node as ExcludeNodeType<typeof node, ObjectProperty | RestElement>);
          }
        })
        .find(nonNull) ?? null
    );
  } else if (pattern.isAssignmentPattern()) {
    return getDestructuringPatternVariableReference(pattern.get('left'), key);
  } else {
    return null;
  }
}

function getClassMemberReferences(
  classNode: NodePath<Class>,
  node: NodePath<ClassMember>,
): Array<AstNodePath> {
  const key = node.get('key');
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
  })(node.node);
  return getClassFieldReferences(classNode, key, computed).filter(
    (reference) => reference !== node,
  );
}

function getClassConstructorParameterPropertyReferences(
  classNode: NodePath<Class>,
  node: NodePath<TSParameterProperty>,
): Array<AstNodePath> {
  const parameter = node.get('parameter');
  const key = parameter.isAssignmentPattern()
    ? parameter.get('left')
    : (parameter as ExcludeNodeType<typeof parameter, AssignmentPattern>);
  if (!key.isIdentifier()) return [];
  const computed = false;
  return getClassFieldReferences(classNode, key, computed).filter(
    (reference) => reference !== node,
  );
}

function isClassConstructor(node: NodePath<ClassMember>): node is NodePath<ClassMethod> {
  return node.isClassMethod() && node.node.kind === 'constructor';
}

function getClassFieldReferences(
  classNode: NodePath<Class>,
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): Array<AstNodePath> {
  const classBodyNode = classNode.get('body');
  return classBodyNode
    .get('body')
    .map((member): Array<AstNodePath> | null => {
      if (!isClassMember(member)) return null;
      if (isClassConstructor(member)) {
        const staticKey = getStaticPropertyKey(key.node, computed);
        if (staticKey == null) return null;
        const params = member.get('params');
        return params
          .map((node) => {
            if (!node.isTSParameterProperty()) return null;
            const parameter = node.get('parameter');
            const fieldName = parameter.isAssignmentPattern()
              ? parameter.get('left')
              : (parameter as ExcludeNodeType<typeof parameter, AssignmentPattern>);
            if (!fieldName.isIdentifier()) return null;
            if (fieldName.node.name !== staticKey) return null;
            return fieldName;
          })
          .filter(nonNull);
      }
      if (!isNamedClassMember(member, key, computed)) return null;
      if (member.isClassProperty()) {
        return [member.get('key')];
      } else if (member.isClassPrivateProperty()) {
        return [member.get('key')];
      } else if (member.isClassAccessorProperty()) {
        return [member.get('key')];
      } else if (member.isClassMethod() || member.isClassPrivateMethod()) {
        const methodName = member.isClassPrivateMethod() ? member.get('key') : member.get('key');
        const selfReferences = getClassMethodSelfReferences(member);
        const fieldReferences = selfReferences.flatMap((reference) =>
          getExpressionAccessorReferences(reference, methodName, computed),
        );
        return [methodName, ...fieldReferences];
      } else {
        unreachableNode(
          member as ExcludeNodeType<
            typeof member,
            | ClassProperty
            | ClassPrivateProperty
            | ClassAccessorProperty
            | ClassMethod
            | ClassPrivateMethod
          >,
        );
      }
    })
    .filter(nonNull)
    .flat();
}

function isNamedClassMember(
  member: NodePath<ClassMember>,
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): boolean {
  if (
    member.isStaticBlock() ||
    member.isTSDeclareMethod() ||
    member.isTSIndexSignature() ||
    member.node.static
  ) {
    return false;
  }
  if (
    member.isClassProperty() ||
    member.isClassPrivateProperty() ||
    member.isClassAccessorProperty()
  ) {
    const propertyKey = member.isClassAccessorProperty()
      ? member.get('key')
      : member.isClassPrivateProperty()
      ? member.get('key')
      : member.get('key');
    if (propertyKey.isPrivateName()) {
      if (!key.isPrivateName() || computed) return false;
      if (key.node.id.name !== propertyKey.node.id.name) return false;
      return true;
    } else {
      const staticKey = getStaticPropertyKey(key.node, computed);
      const staticPropertyKey = getStaticClassMemberKey(member);
      if (staticKey == null || staticPropertyKey == null || staticKey !== staticPropertyKey)
        return false;
      return true;
    }
  } else if (member.isClassMethod() || member.isClassPrivateMethod()) {
    const propertyKey = member.isClassPrivateMethod() ? member.get('key') : member.get('key');
    if (propertyKey.isPrivateName()) {
      if (!key.isPrivateName() || computed) return false;
      if (key.node.id.name !== propertyKey.node.id.name) return false;
      return true;
    } else {
      const staticKey = getStaticPropertyKey(key.node, computed);
      const staticPropertyKey = getStaticClassMemberKey(member);
      if (staticKey == null || staticPropertyKey == null || staticKey !== staticPropertyKey) {
        return false;
      }
      return true;
    }
  } else {
    unreachableNode(
      member as ExcludeNodeType<
        typeof member,
        | ClassProperty
        | ClassPrivateProperty
        | ClassAccessorProperty
        | ClassMethod
        | ClassPrivateMethod
      >,
    );
  }
}

function getClassMethodSelfReferences(
  classMethod: NodePath<ClassMethod | ClassPrivateMethod>,
): Array<NodePath<ThisExpression | Super>> {
  const body = classMethod.get('body');
  const results = new Array<NodePath<ThisExpression | Super>>();
  // Traverse the body for all references to `this` in the current scope
  body.traverse({
    Class(path) {
      // Avoid descending into nested classes
      path.skip();
    },
    Function(path) {
      // Avoid descending into nested functions
      if (!path.isArrowFunctionExpression()) path.skip();
    },
    ThisExpression(path) {
      results.push(path);
    },
    Super(path) {
      results.push(path);
    },
  });
  return results;
}

function getObjectMemberReferences(
  objectNode: NodePath<ObjectExpression>,
  node: NodePath<ObjectMember>,
): Array<AstNodePath> {
  const key = node.get('key');
  const {
    node: { computed },
  } = node;
  return getObjectFieldReferences(objectNode, key, computed).filter(
    (reference) => reference !== node,
  );
}

function getObjectFieldReferences(
  objectNode: NodePath<ObjectExpression>,
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): Array<AstNodePath> {
  return objectNode.get('properties').flatMap((member) => {
    if (!isObjectMember(member) || !isNamedObjectMember(member, key, computed)) return [];
    if (member.isObjectProperty()) {
      return [member.get('key')];
    } else if (member.isObjectMethod()) {
      const methodName = member.get('key');
      const selfReferences = getObjectMethodSelfReferences(member);
      const fieldReferences = selfReferences.flatMap((reference) =>
        getExpressionAccessorReferences(reference, methodName, computed),
      );
      return [methodName, ...fieldReferences];
    } else {
      unreachableNode(member as ExcludeNodeType<typeof member, ObjectProperty | ObjectMethod>);
    }
  });
}

function getObjectMethodSelfReferences(
  classMethod: NodePath<ObjectMethod>,
): Array<NodePath<ThisExpression>> {
  const body = classMethod.get('body');
  const results = new Array<NodePath<ThisExpression>>();
  // Traverse the body for all references to `this` in the current scope
  body.traverse({
    Function(path) {
      // Avoid descending into nested functions
      path.skip();
    },
    Class(path) {
      // Avoid descending into nested classes
      path.skip();
    },
    ThisExpression(path) {
      results.push(path);
    },
  });
  return results;
}

function isObjectMember(
  node: NodePath<ObjectProperty | ObjectMethod | SpreadElement>,
): node is NodePath<ObjectMember> {
  return node.isObjectProperty() || node.isObjectMember();
}

function isNamedObjectMember(
  member: NodePath<ObjectMember>,
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): boolean {
  if (member.isObjectProperty()) {
    const propertyKey = member.get('key');
    if (propertyKey.isPrivateName()) {
      if (!key.isPrivateName() || computed) return false;
      if (key.node.id.name !== propertyKey.node.id.name) return false;
      return true;
    } else {
      const staticKey = getStaticPropertyKey(key.node, computed);
      const staticPropertyKey = getStaticObjectMemberKey(member);
      if (staticKey == null || staticPropertyKey == null || staticKey !== staticPropertyKey)
        return false;
      return true;
    }
  } else if (member.isObjectMethod()) {
    const staticKey = getStaticPropertyKey(key.node, computed);
    const staticPropertyKey = getStaticObjectMemberKey(member);
    if (staticKey == null || staticPropertyKey == null || staticKey !== staticPropertyKey) {
      return false;
    }
    return true;
  } else {
    unreachableNode(member as ExcludeNodeType<typeof member, ObjectProperty | ObjectMethod>);
  }
}

function getMemberExpressionReferences(
  node: NodePath<MemberExpression | OptionalMemberExpression>,
): Array<AstNodePath> {
  const object = node.get('object');
  const key = node.get('property');
  const {
    node: { computed },
  } = node;
  return getAccessorFieldReferences(object, key, computed).filter(
    (reference) => reference !== node,
  );
}

function getAccessorFieldReferences(
  object: NodePath<Expression>,
  key: NodePath<PrivateName | Expression>,
  computed: boolean,
): Array<AstNodePath> {
  if (isTsTypeWrapperNode(object)) {
    return getAccessorFieldReferences(stripTsTypeWrapper(object), key, computed);
  } else if (object.isThisExpression() || object.isSuper()) {
    const enclosingNode = findParentScopeNode(object);
    if (!enclosingNode) return [];
    if (enclosingNode.isClass()) {
      return getClassFieldReferences(enclosingNode, key, computed);
    } else if (enclosingNode.isObjectExpression()) {
      return getObjectFieldReferences(enclosingNode, key, computed);
    } else {
      unreachableNode(
        enclosingNode as ExcludeNodeType<typeof enclosingNode, Class | ObjectExpression>,
      );
    }
  } else {
    return getReferences(object).flatMap((reference) =>
      getExpressionAccessorReferences(reference, key, computed),
    );
  }
}

function findParentScopeNode(expression: AstNodePath): NodePath<Class | ObjectExpression> | null {
  const parentNode = getNodeParent(expression);
  if (parentNode == null) return null;
  if (parentNode.isClass() || parentNode.isObjectExpression()) return parentNode;
  if (parentNode.isFunction() && !parentNode.isArrowFunctionExpression()) return null;
  return findParentScopeNode(parentNode);
}

function getExpressionAccessorReferences(
  reference: AstNodePath,
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): Array<AstNodePath> {
  const parentNode = getNodeParent(reference);
  if (
    (parentNode?.isMemberExpression() || parentNode?.isOptionalMemberExpression()) &&
    reference ===
      stripTsTypeWrapper(
        parentNode.isOptionalMemberExpression()
          ? parentNode.get('object')
          : parentNode.get('object'),
      )
  ) {
    const propertyKey = parentNode.isOptionalMemberExpression()
      ? parentNode.get('property')
      : parentNode.get('property');
    if (propertyKey.isPrivateName()) {
      if (!key.isPrivateName() || computed) return [];
      if (key.node.id.name !== propertyKey.node.id.name) return [];
      return [parentNode];
    } else {
      const staticKey = getStaticPropertyKey(key.node, computed);
      const staticPropertyKey = getStaticMemberExpressionKey(parentNode);
      if (staticKey == null || staticPropertyKey == null || staticKey !== staticPropertyKey) {
        return [];
      }
      return [parentNode];
    }
  } else if (
    parentNode?.isVariableDeclarator() &&
    reference ===
      ((element) => isNonNullNode(element) && stripTsTypeWrapper(element))(parentNode.get('init'))
  ) {
    const id = parentNode.get('id');
    if (!id.isObjectPattern()) return [];
    const staticKey = getStaticPropertyKey(key.node, computed);
    if (staticKey == null) return [];
    return id
      .get('properties')
      .map((property) => {
        if (property.isObjectProperty()) {
          const staticPropertyKey = getStaticObjectMemberKey(property);
          if (staticPropertyKey == null || staticKey !== staticPropertyKey) return [];
          const assignmentTarget = property.get('value');
          if (assignmentTarget.isAssignmentPattern()) {
            return assignmentTarget.get('left');
          } else {
            return assignmentTarget;
          }
        } else if (property.isRestElement()) {
          return [];
        } else {
          unreachableNode(
            property as ExcludeNodeType<typeof property, ObjectProperty | RestElement>,
          );
        }
      })
      .filter(nonNull)
      .flat();
  } else {
    return [];
  }
}
