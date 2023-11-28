import { nonNull } from '@ag-grid-devtools/utils';

import {
  getLiteralPropertyKey,
  getOptionalNodeFieldValue,
  getStaticPropertyKey,
  node as t,
} from './node';
import {
  AccessorKey,
  AccessorReference,
  type AccessorPath,
  type AstNode,
  type Binding,
  type NodePath,
  type Scope,
  type Types,
  type Visitor,
} from './types';

type ArrayPattern = Types.ArrayPattern;
type ArrowFunctionExpression = Types.ArrowFunctionExpression;
type Class = Types.Class;
type ClassPrivateProperty = Types.ClassPrivateProperty;
type Expression = Types.Expression;
type FunctionParent = Types.FunctionParent;
type Identifier = Types.Identifier;
type Literal = Types.Literal;
type Method = Types.Method;
type LVal = Types.LVal;
type MemberExpression = Types.MemberExpression;
type ObjectExpression = Types.ObjectExpression;
type ObjectPattern = Types.ObjectPattern;
type PrivateName = Types.PrivateName;
type Property = Types.Property;
type RestElement = Types.RestElement;
type VariableDeclarator = Types.VariableDeclarator;

export function generateUniqueScopeBinding(scope: Scope, name: string): Identifier {
  return scope.hasBinding(name) ? scope.generateUidIdentifier(name) : t.identifier(name);
}

export function getAccessorExpressionPaths(
  expression: NodePath<Expression>,
): Array<AccessorPath> | null {
  if (expression.isIdentifier()) return getIdentifierAccessorPaths(expression);
  if (expression.isMemberExpression()) return getMemberExpressionAccessorPaths(expression);
  if (expression.isAssignmentExpression()) {
    return getAccessorExpressionPaths(expression.get('right'));
  }
  const typescriptExpression = getDesugaredTypescriptExpression(expression);
  if (typescriptExpression) return getAccessorExpressionPaths(typescriptExpression);
  return [{ root: { target: expression, references: [] }, path: [] }];
}

function getMemberExpressionAccessorPaths(
  expression: NodePath<MemberExpression>,
): Array<AccessorPath> | null {
  const object = expression.get('object');
  const property = expression.get('property');
  const computed = expression.node.computed;
  if (object.isThisExpression()) {
    const classDefinition = getEnclosingClass(object);
    if (!classDefinition) return null;
    return getClassFieldAccessorPaths(classDefinition, expression);
  }
  const objectPaths = getAccessorExpressionPaths(object);
  if (!objectPaths) return null;
  const key = getPropertyKey(property, computed);
  if (!key) return null;
  return objectPaths.map(({ root, path }) => ({
    root,
    path: [...path, { key, references: [] }],
  }));
}

export function getClassFieldAccessorPaths(
  classDefinition: NodePath<Class | ObjectExpression>,
  accessor: NodePath<MemberExpression | Property>,
): Array<AccessorPath> | null {
  const key = accessor.isMemberExpression()
    ? accessor.get('property')
    : accessor.isProperty()
    ? accessor.get('key')
    : null;
  const computed =
    accessor.isMemberExpression() || (accessor.isProperty() && isPublicProperty(accessor))
      ? accessor.node.computed
      : false;
  if (!key) return null;
  // FIXME: avoid unnecessarily recomputing member accessor initializers for each reference
  const accessors = findClassMemberAccessorExpressions(classDefinition, key, computed);
  if (!accessors) return null;
  const reference = AccessorReference.Property({ target: classDefinition, accessor });
  const declarations = accessors
    .map((accessor) => {
      if (accessor.isProperty()) return accessor;
      return null;
    })
    .filter(nonNull);
  const initializers = declarations
    .map((property) => {
      const initializer = property.get('value');
      if (!initializer.isExpression()) return null;
      return initializer;
    })
    .filter(nonNull);
  const reassignments = accessors
    .map((accessor) => {
      if (accessor.isMemberExpression()) {
        // FIXME: support nested member expression assignments (e.g. this.foo.bar.baz = qux)
        if (
          accessor.parentPath.isAssignmentExpression() &&
          accessor.parentPath.node.operator === '=' &&
          accessor.parentPath.get('left').node === accessor.node &&
          accessor.parentPath.get('right').node !== accessor.node
        ) {
          return accessor.parentPath.get('right');
        }
      }
      return null;
    })
    .filter(nonNull);
  const assignedValues = [...initializers, ...reassignments];
  if (assignedValues.length === 0) {
    return [
      {
        root: {
          target: accessor,
          references: [
            ...declarations.map((property) =>
              AccessorReference.Property({ target: classDefinition, accessor: property }),
            ),
            reference,
          ],
        },
        path: [],
      },
    ];
  }
  return assignedValues
    .flatMap((expression) => getAccessorExpressionPaths(expression) || [])
    .map((accessorPath) => {
      if (!reference) return accessorPath;
      return registerAccessorPathReference(accessorPath, reference);
    });
}

function findClassMemberAccessorExpressions(
  classDefinition: NodePath<Class | ObjectExpression>,
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): Array<NodePath<Property | MemberExpression>> | null {
  if (!computed && key.isIdentifier()) {
    return findNamedClassMemberAccessorExpressions(classDefinition, key.node.name);
  }
  if (key.isPrivateName()) {
    return findPrivateClassMemberAccessorExpressions(classDefinition, key);
  }
  if (key.isLiteral()) {
    return findLiteralClassMemberAccessorExpressions(classDefinition, key);
  }
  return null;
}

function findNamedClassMemberAccessorExpressions(
  classDefinition: NodePath<Class | ObjectExpression>,
  fieldName: string,
): Array<NodePath<Property | MemberExpression>> {
  return findClassMemberAccessors(classDefinition, null, (path) => {
    if (path.isProperty()) return matchNamedClassMemberPropertyExpression(fieldName, path);
    if (path.isMemberExpression()) {
      const property = path.get('property');
      const computed = path.node.computed;
      return matchNamedPropertyKeyExpression(fieldName, property, computed);
    }
    return false;
  });
}

function matchNamedClassMemberPropertyExpression(
  fieldName: string,
  property: NodePath<Property>,
): boolean {
  if (!isPublicProperty(property)) return false;
  return matchNamedPublicPropertyExpression(fieldName, property);
}

function findPrivateClassMemberAccessorExpressions(
  classDefinition: NodePath<Class | ObjectExpression>,
  fieldName: NodePath<PrivateName>,
): Array<NodePath<Property | MemberExpression>> {
  return findClassMemberAccessors(classDefinition, null, (path) => {
    if (path.isProperty()) return matchPrivateClassMemberPropertyExpression(fieldName, path);
    if (path.isMemberExpression()) {
      const property = path.get('property');
      const computed = path.node.computed;
      if (computed) return false;
      return property.isPrivateName() && property.node.id.name === fieldName.node.id.name;
    }
    return false;
  });
}

function matchPrivateClassMemberPropertyExpression(
  memberName: NodePath<PrivateName>,
  property: NodePath<Property>,
): boolean {
  if (!property.isClassPrivateProperty(property)) return false;
  return memberName.node.id.name === property.node.key.id.name;
}

function findLiteralClassMemberAccessorExpressions(
  classDefinition: NodePath<Class | ObjectExpression>,
  fieldName: NodePath<Literal>,
): Array<NodePath<Property | MemberExpression>> | null {
  const propertyKey = getLiteralPropertyKey(fieldName.node);
  if (typeof propertyKey !== 'string') return null;
  return findClassMemberAccessors(classDefinition, null, (path) => {
    if (path.isProperty()) return matchComputedClassMemberPropertyExpression(propertyKey, path);
    if (path.isMemberExpression()) {
      const property = path.get('property');
      const computed = path.node.computed;
      return getStaticPropertyKey(property.node, computed) === propertyKey;
    }
    return false;
  });
}

function matchComputedClassMemberPropertyExpression(
  fieldName: string,
  property: NodePath<Property>,
): boolean {
  if (!isPublicProperty(property)) return false;
  return matchNamedPublicPropertyExpression(fieldName, property);
}

function isPublicProperty(
  property: NodePath<Property>,
): property is NodePath<Exclude<Property, ClassPrivateProperty>> {
  if (property.isClassPrivateProperty()) return false;
  return true;
}

function matchNamedPublicPropertyExpression(
  fieldName: string,
  property: NodePath<Exclude<Property, ClassPrivateProperty>>,
): boolean {
  const key = property.get('key');
  const computed = property.node.computed;
  return matchNamedPropertyKeyExpression(fieldName, key, computed);
}

export function matchNamedPropertyKeyExpression(
  fieldName: string,
  property: NodePath<Expression | PrivateName>,
  computed: boolean,
): boolean {
  return getStaticPropertyKey(property.node, computed) === fieldName;
}

/**
 * Get a set of accessors for instance fields of a given class
 *
 * All references within the provided class definition to its top-level instance fields will be passed to the provided
 * predicate function to determine whether to be included in the output set
 */
export function findClassMemberAccessors<T extends Property | MemberExpression>(
  classDefinition: NodePath<Class | ObjectExpression>,
  root: NodePath<AstNode> | null,
  predicate: (path: NodePath<Property | MemberExpression>) => path is NodePath<T>,
): Array<NodePath<T>>;
export function findClassMemberAccessors(
  classDefinition: NodePath<Class | ObjectExpression>,
  root: NodePath<AstNode> | null,
  predicate: (path: NodePath<Property | MemberExpression>) => boolean,
): Array<NodePath<Property | MemberExpression>>;
export function findClassMemberAccessors(
  classDefinition: NodePath<Class | ObjectExpression>,
  root: NodePath<AstNode> | null,
  predicate: (path: NodePath<Property | MemberExpression>) => boolean,
): Array<NodePath<Property | MemberExpression>> {
  // See https://github.com/babel/babel/blob/main/packages/babel-helper-environment-visitor
  const visitor: Visitor<Array<NodePath<Property | MemberExpression>>> = {
    Class(path) {
      if (path.node !== classDefinition.node) path.skip();
    },
    ObjectExpression(path) {
      if (path.node !== classDefinition.node) path.skip();
    },
    FunctionParent(path) {
      // Ignore functions that do not have their lexical scope bound to the enclosing class
      if (!isLexicallyBoundFunction(path, classDefinition)) path.skip();
    },
    Property(path, state) {
      // Ignore unrelated object properties (e.g. in destructuring patterns)
      if (path.isObjectProperty() && path.parentPath.node !== classDefinition.node) return;
      // Invoke the user-provided function to determine whether the property definition is a match
      if (predicate(path)) state.push(path);
    },
    MemberExpression(path, state) {
      const object = path.get('object');
      // Ignore property accesses on objects other than `this`
      if (!object.isThisExpression()) return;
      // Invoke the user-provided function to determine whether the property access is a match
      if (predicate(path)) state.push(path);
    },
  };
  const state = new Array<NodePath<Property | MemberExpression>>();
  (root || classDefinition).traverse(visitor, state);
  return state;
}

function isLexicallyBoundFunction(
  path: NodePath<FunctionParent>,
  enclosingClass: NodePath<Class | ObjectExpression>,
): path is NodePath<Method | ArrowFunctionExpression> {
  if (path.isMethod()) return true;
  if (path.isArrowFunctionExpression()) return true;
  if (
    enclosingClass.isObjectExpression() &&
    path.parentPath.isObjectProperty() &&
    path.parentPath.get('value').node === path.node &&
    path.parentPath.get('key').node !== path.node
  ) {
    return true;
  }
  return false;
}

function getEnclosingClass(
  expression: NodePath<Expression>,
): NodePath<Class | ObjectExpression> | null {
  const enclosingFunction = expression.getFunctionParent();
  if (!enclosingFunction) return null;
  if (enclosingFunction.isMethod()) {
    const classBody = enclosingFunction.parentPath;
    if (classBody.isObjectExpression()) return classBody;
    if (classBody.isClassBody() && classBody.parentPath.isClass()) return classBody.parentPath;
    return null;
  }
  if (enclosingFunction.isArrowFunctionExpression()) return getEnclosingClass(enclosingFunction);
  if (enclosingFunction.parentPath.isObjectExpression()) return enclosingFunction.parentPath;
  return null;
}

function getIdentifierAccessorPaths(identifier: NodePath<Identifier>): Array<AccessorPath> | null {
  const binding = identifier.scope.getBinding(identifier.node.name);
  if (!binding) return null;
  switch (binding.kind) {
    case 'var':
    case 'let':
    case 'const':
      if (!binding.path.isVariableDeclarator()) return null;
      return getVariableAccessorPaths(binding, binding.path, identifier);
    case 'module':
    case 'hoisted':
    case 'param':
    case 'local':
    case 'unknown':
      return [
        {
          root: {
            target: binding.path,
            references: [AccessorReference.Local({ binding, accessor: identifier })],
          },
          path: [],
        },
      ];
  }
}

function getVariableAccessorPaths(
  binding: Binding,
  declaration: NodePath<VariableDeclarator>,
  accessor: NodePath<Identifier>,
): Array<AccessorPath> | null {
  const variableName = accessor.node;
  const propertyPath = getDestructuredPropertyPath(declaration.get('id'), variableName, {
    path: [],
    precedingSiblings: null,
  });
  if (!propertyPath) return null;
  const reference = AccessorReference.Local({ binding, accessor });
  const initializer = getOptionalNodeFieldValue(declaration.get('init'));
  const reassignments = binding.constantViolations;
  const assignedValues = [
    ...(initializer ? [initializer] : []),
    ...reassignments
      .map((expression) => {
        if (!expression.isAssignmentExpression() || expression.node.operator !== '=') return null;
        const target = expression.get('left');
        const value = expression.get('right');
        if (target.isIdentifier() && target.node.name === variableName.name) return value;
        // FIXME: support advanced assignment methods when determining accessor paths
        return null;
      })
      .filter(nonNull),
  ].flatMap((value) => {
    const initializerAccessorPaths = getAccessorExpressionPaths(value);
    if (!initializerAccessorPaths) return [];
    return initializerAccessorPaths.map(({ root, path }) => {
      const combinedAccessorPath: AccessorPath = {
        root,
        path: [...path, ...propertyPath.map((key) => ({ key, references: [] }))],
      };
      return registerAccessorPathReference(combinedAccessorPath, reference);
    });
  });
  if (assignedValues.length === 0) {
    return [{ root: { target: declaration, references: [reference] }, path: [] }];
  }
  return assignedValues;
}

interface AccessorParentPattern {
  path: Array<AccessorKey>;
  precedingSiblings: PrecedingObjectProperties | PrecedingArrayItems | null;
}

enum PrecedingFieldsType {
  Object,
  Array,
}

interface PrecedingFields<T extends PrecedingFieldsType> {
  type: T;
}

interface PrecedingObjectProperties extends PrecedingFields<PrecedingFieldsType.Object> {
  fields: Array<AccessorKey>;
}

interface PrecedingArrayItems extends PrecedingFields<PrecedingFieldsType.Array> {
  count: number;
}

function getDestructuredPropertyPath(
  propertyPath: NodePath<LVal>,
  id: Identifier,
  parentPattern: AccessorParentPattern,
): Array<AccessorKey> | null {
  if (propertyPath.isIdentifier()) {
    return propertyPath.node.name === id.name ? parentPattern.path : null;
  }
  if (propertyPath.isMemberExpression()) {
    // FIXME: Support extended destructuring syntax
    return null;
  }
  if (propertyPath.isAssignmentPattern()) {
    // FIXME: Expose default value initializers as variable assignments
    return getDestructuredPropertyPath(propertyPath.get('left'), id, parentPattern);
  }
  if (propertyPath.isArrayPattern()) {
    return getDestructuredArrayPropertyPath(propertyPath, id, parentPattern);
  }
  if (propertyPath.isObjectPattern()) {
    return getDestructuredObjectPropertyPath(propertyPath, id, parentPattern);
  }
  if (propertyPath.isRestElement()) {
    return getDestructuredRestPatternPropertyPath(propertyPath, id, parentPattern);
  }
  return null;
}

function getDestructuredRestPatternPropertyPath(
  declaration: NodePath<RestElement>,
  id: Identifier,
  parentPattern: AccessorParentPattern,
): Array<AccessorKey> | null {
  const { precedingSiblings } = parentPattern;
  const identifier = declaration.get('argument');
  const key: AccessorKey | null = !precedingSiblings
    ? null
    : precedingSiblings.type === PrecedingFieldsType.Array
    ? AccessorKey.ArrayRest({ startIndex: precedingSiblings.count })
    : precedingSiblings.type === PrecedingFieldsType.Object
    ? AccessorKey.ObjectRest({ excluded: precedingSiblings.fields })
    : null;
  if (!key) return null;
  return getDestructuredPropertyPath(identifier, id, {
    path: [...parentPattern.path, key],
    precedingSiblings: null,
  });
}

function getDestructuredArrayPropertyPath(
  declaration: NodePath<ArrayPattern>,
  id: Identifier,
  parentPattern: AccessorParentPattern,
): Array<AccessorKey> | null {
  const matchingAccessorPathsForVariable = declaration.get('elements').reduce(
    (acc, property) => {
      const variableName = getOptionalNodeFieldValue(property);
      if (!variableName) return acc;
      if (variableName.isRestElement()) {
        const restPattern = variableName.get('argument');
        // FIXME: support destructured rest elements: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#using_a_binding_pattern_as_the_rest_property
        if (!restPattern.isIdentifier() || restPattern.node.name !== id.name) return acc;
        const key = AccessorKey.ArrayRest({ startIndex: acc.numPrecedingSiblings });
        const result = [...parentPattern.path, key];
        acc.results.push(result);
        return acc;
      }
      const key = AccessorKey.Index({ index: acc.numPrecedingSiblings });
      const result = getDestructuredPropertyPath(variableName, id, {
        path: [...parentPattern.path, key],
        precedingSiblings: { type: PrecedingFieldsType.Array, count: acc.numPrecedingSiblings },
      });
      if (result) acc.results.push(result);
      acc.numPrecedingSiblings++;
      return acc;
    },
    {
      results: new Array<Array<AccessorKey>>(),
      numPrecedingSiblings: 0,
    },
  ).results;
  if (matchingAccessorPathsForVariable.length === 0) return null;
  const [accessorPath] = matchingAccessorPathsForVariable;
  return accessorPath;
}

function getDestructuredObjectPropertyPath(
  declaration: NodePath<ObjectPattern>,
  id: Identifier,
  parentPattern: AccessorParentPattern,
): Array<AccessorKey> | null {
  const matchingAccessorPathsForVariable = declaration.get('properties').reduce(
    (acc, property) => {
      if (property.isRestElement()) {
        const restIdentifier = property.get('argument');
        if (!restIdentifier.isIdentifier() || restIdentifier.node.name !== id.name) return acc;
        const key = AccessorKey.ObjectRest({ excluded: acc.precedingProperties });
        const result = [...parentPattern.path, key];
        acc.results.push(result);
        return acc;
      }
      if (property.isObjectProperty()) {
        const targetProperty = property.get('key');
        const computed = property.node.computed;
        const key = getPropertyKey(targetProperty, computed);
        if (!key) return acc;
        const variableName = property.get('value');
        // FIXME: Confirm object destructuring syntax restrictions
        if (!variableName.isLVal()) return acc;
        const result = getDestructuredPropertyPath(variableName, id, {
          path: [...parentPattern.path, key],
          precedingSiblings: { type: PrecedingFieldsType.Object, fields: acc.precedingProperties },
        });
        if (result) acc.results.push(result);
        acc.precedingProperties.push(key);
        return acc;
      }
      return acc;
    },
    { results: new Array<Array<AccessorKey>>(), precedingProperties: new Array<AccessorKey>() },
  ).results;
  const accessorPath = matchingAccessorPathsForVariable[0] || null;
  return accessorPath;
}

function getPropertyKey(
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

function registerAccessorPathReference(
  accessor: AccessorPath,
  reference: AccessorReference,
): AccessorPath {
  const { root, path } = accessor;
  if (path.length > 0) {
    return {
      root,
      path: [
        ...path.slice(0, -1),
        {
          key: path[path.length - 1].key,
          references: [reference, ...path[path.length - 1].references],
        },
      ],
    };
  } else {
    return {
      root: {
        target: root.target,
        references: [reference, ...root.references],
      },
      path,
    };
  }
}

function getDesugaredTypescriptExpression(
  expression: NodePath<Expression>,
): NodePath<Expression> | null {
  if (expression.isTSInstantiationExpression()) {
    return expression.get('expression');
  }
  if (expression.isTSAsExpression()) {
    return expression.get('expression');
  }
  if (expression.isTSSatisfiesExpression()) {
    return expression.get('expression');
  }
  if (expression.isTSTypeAssertion()) {
    return expression.get('expression');
  }
  if (expression.isTSNonNullExpression()) {
    return expression.get('expression');
  }
  return null;
}
