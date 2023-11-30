import { Enum, match, nonNull } from '@ag-grid-devtools/utils';
import type {
  TSAsExpression,
  TSInstantiationExpression,
  TSNonNullExpression,
  TSParameterProperty,
  TSSatisfiesExpression,
  TSTypeAssertion,
  ArrayPattern,
  ArrowFunctionExpression,
  AssignmentPattern,
  Class,
  ClassPrivateProperty,
  Expression,
  FunctionDeclaration,
  FunctionParent,
  Identifier,
  Literal,
  LVal,
  Method,
  MemberExpression,
  ObjectExpression,
  ObjectMethod,
  ObjectPattern,
  OptionalMemberExpression,
  PatternLike,
  PrivateName,
  Property,
  RestElement,
  VariableDeclarator,
  ObjectProperty,
} from '@babel/types';

import {
  createPropertyKey,
  createStaticPropertyKey,
  getLiteralPropertyKey,
  getNamedObjectLiteralStaticProperty,
  getNamedObjectLiteralStaticPropertyValue,
  getNamedObjectPatternStaticPropertyValue,
  getOptionalNodeFieldValue,
  getStaticPropertyKey,
  node as t,
} from './node';
import {
  areAccessorKeysEqual,
  AccessorKey,
  AccessorReference,
  type AccessorPath,
  type AstNode,
  type Binding,
  type NodePath,
  type Scope,
  type Visitor,
} from './types';

export type Reference = Enum<{
  Variable: {
    path: NodePath<Identifier>;
  };
  ObjectPattern: {
    path: NodePath<ObjectPattern>;
  };
  ArrayPattern: {
    path: NodePath<ArrayPattern>;
  };
  DestructuringAccessor: {
    path: NodePath<Identifier>;
    destructuring: Array<[AccessorKey, NodePath<LVal>]>;
  };
  PropertyAccessor: {
    path: NodePath<MemberExpression | OptionalMemberExpression>;
  };
  FunctionDeclaration: {
    path: NodePath<FunctionDeclaration>;
  };
  Value: {
    path: NodePath<Expression | ObjectMethod>;
  };
  PropertyInitializer: {
    path: NodePath<ObjectProperty | ObjectMethod>;
  };
}>;

export const Reference = Enum.create<Reference>({
  Variable: true,
  ObjectPattern: true,
  ArrayPattern: true,
  DestructuringAccessor: true,
  PropertyAccessor: true,
  FunctionDeclaration: true,
  Value: true,
  PropertyInitializer: true,
});

export function generateUniqueScopeBinding(scope: Scope, name: string): Identifier {
  return scope.hasBinding(name) ? scope.generateUidIdentifier(name) : t.identifier(name);
}

export function getExpressionReferences(target: NodePath<Expression>): Array<Reference> {
  // Strip away any TypeScript annotations wrapping the expression
  const expression = stripTypeScriptAnnotations(target);
  if (expression !== target) return getExpressionReferences(expression);
  // If the current expression is being assigned to another variable, return all the references to that variable
  const assignmentTarget = getValueAssignmentTarget(expression);
  if (assignmentTarget) {
    return [
      Reference.Value({ path: expression }),
      ...getLocalAccessorReferences(assignmentTarget).filter(
        (reference) => reference.path.node !== expression.node,
      ),
    ];
  }
  // If the current expression is a local accessor, return all the other references to that local accessor
  if (expression.isOptionalMemberExpression() || expression.isLVal()) {
    return getLocalAccessorReferences(expression);
  }
  return [Reference.Value({ path: expression })];
}

function getValueAssignmentTarget(
  target: NodePath<Expression>,
): NodePath<TypeErased<OptionalMemberExpression | LVal>> | null {
  const expression = stripTypeScriptAnnotations(target);
  if (expression !== target) return getValueAssignmentTarget(expression);
  const parent = getTypeErasedParent(expression);
  if (parent && parent.isVariableDeclarator()) {
    const assignedValue = getOptionalNodeFieldValue(parent.get('init'));
    if (!assignedValue) return null;
    if (stripTypeScriptAnnotations(assignedValue).node !== expression.node) return null;
    const localAccessor = stripTypeScriptAnnotations(parent.get('id'));
    return localAccessor;
  }
  if (parent && parent.isAssignmentExpression()) {
    const assignedValue = stripTypeScriptAnnotations(parent.get('right'));
    if (stripTypeScriptAnnotations(assignedValue).node !== expression.node) return null;
    const localAccessor = stripTypeScriptAnnotations(parent.get('left'));
    return localAccessor;
  }
  return null;
}

export function getLocalAccessorReferences(
  target: NodePath<OptionalMemberExpression | LVal>,
): Array<Reference> {
  // Strip away any TypeScript annotations wrapping the expression
  const expression = stripTypeScriptAnnotations(target);
  if (expression !== target) return getLocalAccessorReferences(expression);
  // Parse the local accessor and follow its references
  return getLocalAccessorTargets(expression).flatMap((assignmentTarget) =>
    match(assignmentTarget, {
      // If the local accessor is an alias to a variable, return all the other references to that variable
      Variable: (ref) => getIdentifierExpressionReferences(ref.path),
      // If the local accessor is an alias to an object property, return all the other references to that object property
      PropertyAccessor: (ref) => [ref, ...getPropertyAccessorReferences(ref.path)],
      // If the local accessor is an alias to a hoisted function, return all the other references to that function
      FunctionDeclaration: (ref) => [ref, ...getFunctionDeclarationReferences(ref.path)],
      // If the local accessor is a destructuring pattern, there can be no other references to that variable (only its contents)
      ObjectPattern: (ref) => [ref],
      ArrayPattern: (ref) => [ref],
      // If the local accessor is an alias to a destructured variable, return all the other references to that variable
      DestructuringAccessor: (ref) => getIdentifierExpressionReferences(ref.path),
      // References to value initializers will already be covered by the references to the assignment expression's accessor
      Value: (ref) => [ref],
      // References to value initializer properties will already be covered by the references to the assignment expression's accessor
      PropertyInitializer: (ref) => [ref],
    }),
  );
}

function getLocalAccessorTargets(
  target: NodePath<TypeErased<OptionalMemberExpression | LVal>>,
): Array<Reference> {
  if (target.isAssignmentPattern()) {
    const localAssignment = stripTypeScriptAnnotations(target.get('left'));
    const defaultValue = stripTypeScriptAnnotations(target.get('right'));
    return [...getLocalAccessorTargets(localAssignment), Reference.Value({ path: defaultValue })];
  }
  if (target.isIdentifier()) {
    return [Reference.Variable({ path: target })];
  }
  if (target.isObjectPattern()) {
    return [Reference.ObjectPattern({ path: target })];
  }
  if (target.isArrayPattern()) {
    return [Reference.ArrayPattern({ path: target })];
  }
  if (target.isMemberExpression() || target.isOptionalMemberExpression()) {
    return [Reference.PropertyAccessor({ path: target })];
  }
  if (target.isRestElement()) {
    // FIXME: support destructured rest elements: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#using_a_binding_pattern_as_the_rest_property
    return [];
  }
  return [];
}

export function getIdentifierExpressionReferences(target: NodePath<Identifier>): Array<Reference> {
  const binding = target.scope.getBinding(target.node.name);
  if (!binding) return [];
  const declaration = getBindingTargetReference(binding, target);
  const initializers = getBindingInitializers(binding, target);
  const assignments = binding.constantViolations
    .map((path) => {
      if (!path.isAssignmentExpression()) return null;
      const assignmentTarget = stripTypeScriptAnnotations(path.get('left'));
      if (assignmentTarget.isIdentifier() && assignmentTarget.node.name === target.node.name) {
        return Reference.Variable({ path: assignmentTarget });
      }
      return null;
    })
    .filter(nonNull);
  const accessors = binding.referencePaths
    .map((path) => {
      if (path.node === target.node) return null;
      if (path.isIdentifier()) return path;
      return null;
    })
    .filter(nonNull)
    .flatMap((accessor) => {
      const assignmentTarget = getValueAssignmentTarget(accessor);
      return [
        Reference.Variable({ path: accessor }),
        ...(assignmentTarget ? getLocalAccessorReferences(assignmentTarget) : []),
      ];
    });
  return [
    ...(declaration ? [declaration] : []),
    ...initializers.map((initializer) => Reference.Value({ path: initializer })),
    ...assignments,
    ...accessors,
  ];
}

function getPropertyAccessorReferences(
  target: NodePath<MemberExpression | OptionalMemberExpression>,
): Array<Reference> {
  if (target.isMemberExpression()) return getMemberExpressionReferences(target);
  if (target.isOptionalMemberExpression()) return getOptionalMemberExpressionReferences(target);
  return [];
}

export function getMemberExpressionReferences(
  target: NodePath<MemberExpression>,
): Array<Reference> {
  const key = stripTypeScriptAnnotations(target.get('property'));
  const computed = target.node.computed;
  const object = stripTypeScriptAnnotations(target.get('object'));
  return getObjectPropertyReferences(object, key.node, computed).filter(
    (reference) => reference.path.node !== target.node,
  );
}

export function getOptionalMemberExpressionReferences(
  target: NodePath<OptionalMemberExpression>,
): Array<Reference> {
  const key = stripTypeScriptAnnotations(target.get('property'));
  const computed = target.node.computed;
  const object = stripTypeScriptAnnotations(target.get('object'));
  return getObjectPropertyReferences(object, key.node, computed).filter(
    (reference) => reference.path.node !== target.node,
  );
}

export function getFunctionDeclarationReferences(
  target: NodePath<FunctionDeclaration>,
): Array<Reference> {
  const functionName = target.node.id;
  const binding = functionName ? target.scope.getBinding(functionName.name) : null;
  if (!binding) return [];
  const accessors = binding.referencePaths
    .map((path) => {
      if (path.node === target.node) return null;
      if (path.isIdentifier()) return Reference.Variable({ path });
      return null;
    })
    .filter(nonNull);
  return accessors;
}

export function getObjectPropertyReferences(
  target: NodePath<Expression>,
  key: Expression | PrivateName,
  computed: boolean,
): Array<Reference> {
  const propertyKey = createStaticPropertyKey(key, computed);
  if (!propertyKey) return [];
  const targetReferences = getExpressionReferences(target);
  return targetReferences.flatMap((objectReference) => {
    // If this is an object literal initializer value with a matching key, get a reference to the given property value
    const literalPropertyInitializer =
      Reference.Value.is(objectReference) && objectReference.path.isObjectExpression()
        ? getNamedObjectLiteralStaticProperty(objectReference.path, propertyKey)
        : null;
    const literalPropertyInitializerReferences = literalPropertyInitializer
      ? [Reference.PropertyInitializer({ path: literalPropertyInitializer })]
      : [];
    // If this is an object destructuring pattern, get a reference to the child patterns that match the given key
    const destructuredPropertyPattern = Reference.ObjectPattern.is(objectReference)
      ? getNamedObjectPatternStaticPropertyValue(objectReference.path, propertyKey)
      : null;
    const destructuredPropertyReferences = destructuredPropertyPattern
      ? getLocalAccessorReferences(destructuredPropertyPattern)
      : [];
    // Analyze further references based on the context in which the current node occurs
    const parentAccessorPropertyReferences = (() => {
      const parent = getTypeErasedParent(objectReference.path);
      if (!parent) return [];
      // If the reference target forms part of a matching property accessor, get a reference to the overall accessor expression
      // FIXME: clean up
      if (parent.isMemberExpression()) {
        const accessorProperty = stripTypeScriptAnnotations(parent.get('property'));
        const accessorComputed = parent.node.computed;
        const accessorKey = createPropertyKey(accessorProperty, accessorComputed);
        if (!accessorKey || !areAccessorKeysEqual(propertyKey, accessorKey)) return [];
        const grandparent = getTypeErasedParent(parent);
        if (grandparent && grandparent.isAssignmentExpression()) {
          const value = stripTypeScriptAnnotations(grandparent.get('right'));
          return [Reference.PropertyAccessor({ path: parent }), Reference.Value({ path: value })];
        }
        return [Reference.PropertyAccessor({ path: parent })];
      }
      // If the reference target forms part of a matching property accessor assignment, get a reference to the overall accessor expression
      if (parent.isAssignmentExpression()) {
        const assignmentTarget = stripTypeScriptAnnotations(parent.get('left'));
        if (!assignmentTarget.isMemberExpression()) return [];
        const accessorProperty = stripTypeScriptAnnotations(assignmentTarget.get('property'));
        const accessorComputed = assignmentTarget.node.computed;
        const accessorKey = createPropertyKey(accessorProperty, accessorComputed);
        if (!accessorKey || !areAccessorKeysEqual(propertyKey, accessorKey)) return [];
        const value = stripTypeScriptAnnotations(parent.get('right'));
        return [
          Reference.PropertyAccessor({ path: assignmentTarget }),
          Reference.Value({ path: value }),
        ];
      }
      // If the reference target is the property of a destructuring pattern, get references to the matching destructured properties
      if (parent.isObjectPattern()) {
        return parent
          .get('properties')
          .filter((property) => {
            if (property.isRestElement()) return true;
            if (property.isObjectProperty()) {
              const accessorKey = createPropertyKey(
                stripTypeScriptAnnotations(property.get('key')),
                property.node.computed,
              );
              if (!accessorKey) return false;
              return areAccessorKeysEqual(propertyKey, accessorKey);
            }
            return false;
          })
          .map((property) => {
            if (property.isObjectProperty()) {
              const localAssignment = property.get('value');
              if (!localAssignment.isPatternLike()) return null;
              return getLocalAccessorTargets(stripTypeScriptAnnotations(localAssignment));
            }
            if (property.isRestElement()) {
              const localAssignment = property.get('argument');
              if (localAssignment.isAssignmentPattern()) {
                const target = localAssignment.get('left');
                const defaultValue = localAssignment.get('right');
                const targetReferences = target.isExpression()
                  ? getObjectPropertyReferences(target, key, computed)
                  : [];
                return [
                  ...targetReferences,
                  ...getObjectPropertyReferences(defaultValue, key, computed),
                ];
              } else if (localAssignment.isIdentifier()) {
                return getObjectPropertyReferences(localAssignment, key, computed);
              } else {
                return null;
              }
            }
            return null;
          })
          .filter(nonNull)
          .flat();
      }
      return [];
    })();
    return [
      ...literalPropertyInitializerReferences,
      ...destructuredPropertyReferences,
      ...parentAccessorPropertyReferences,
    ];
  });
}

function getBindingTargetReference(
  binding: Binding,
  identifier: NodePath<Identifier>,
): Reference | null {
  switch (binding.kind) {
    case 'var':
    case 'let':
    case 'const':
      if (!binding.path.isVariableDeclarator()) return null;
      const targetVariable = binding.path.get('id');
      return getBindingAssignmentTargetReference(targetVariable, identifier, []);
    case 'module':
      if (binding.path.isImportSpecifier()) {
        return Reference.Variable({ path: binding.path.get('local') });
      }
      if (binding.path.isImportDefaultSpecifier()) {
        return Reference.Variable({ path: binding.path.get('local') });
      }
      if (binding.path.isImportNamespaceSpecifier()) {
        return Reference.Variable({ path: binding.path.get('local') });
      }
      return null;
    case 'param':
    case 'local':
      if (binding.path.isIdentifier()) return Reference.Variable({ path: binding.path });
      return null;
    case 'hoisted':
      if (binding.path.isFunctionDeclaration()) {
        return Reference.FunctionDeclaration({ path: binding.path });
      }
      return null;
    case 'unknown':
      if (binding.path.isIdentifier()) return Reference.Variable({ path: binding.path });
      return null;
  }
}

function getBindingAssignmentTargetReference(
  targetVariable: NodePath<LVal>,
  local: NodePath<Identifier>,
  parentPath: Array<[AccessorKey, NodePath<PatternLike>]>,
): Reference | null {
  if (targetVariable.isIdentifier()) {
    return getIdentifierBindingAssignmentTargetReference(targetVariable, local, parentPath);
  }
  if (targetVariable.isAssignmentPattern()) {
    return getDefaultedBindingAssignmentTargetReference(targetVariable, local, parentPath);
  }
  if (targetVariable.isObjectPattern()) {
    return getDestructuredObjectBindingAssignmentTargetReference(targetVariable, local, parentPath);
  }
  if (targetVariable.isArrayPattern()) {
    return getDestructuredArrayBindingAssignmentTargetReference(targetVariable, local, parentPath);
  }
  if (targetVariable.isRestElement()) {
    return getDestructuredRestBindingAssignmentTargetReference(targetVariable, local, parentPath);
  }
  return null;
}

function getIdentifierBindingAssignmentTargetReference(
  targetVariable: NodePath<Identifier>,
  identifier: NodePath<Identifier>,
  parentPath: Array<[AccessorKey, NodePath<PatternLike>]>,
): Reference | null {
  if (targetVariable.node.name !== identifier.node.name) return null;
  if (parentPath.length === 0) {
    return Reference.Variable({ path: targetVariable });
  } else {
    return Reference.DestructuringAccessor({
      path: targetVariable,
      destructuring: parentPath,
    });
  }
}

function getDefaultedBindingAssignmentTargetReference(
  targetVariable: NodePath<AssignmentPattern>,
  identifier: NodePath<Identifier>,
  parentPath: Array<[AccessorKey, NodePath<PatternLike>]>,
): Reference | null {
  return getBindingAssignmentTargetReference(targetVariable.get('left'), identifier, parentPath);
}

function getDestructuredArrayBindingAssignmentTargetReference(
  targetVariable: NodePath<ArrayPattern>,
  identifier: NodePath<Identifier>,
  parentPath: Array<[AccessorKey, NodePath<PatternLike>]>,
): Reference | null {
  return (
    targetVariable
      .get('elements')
      .map((element, index) => {
        const localAccessor = getOptionalNodeFieldValue(element);
        if (!localAccessor || !localAccessor.isPatternLike()) return null;
        if (localAccessor.isRestElement()) {
          return getBindingAssignmentTargetReference(localAccessor, identifier, [
            ...parentPath,
            [AccessorKey.ArrayRest({ startIndex: index }), localAccessor],
          ]);
        }
        return getBindingAssignmentTargetReference(localAccessor, identifier, [
          ...parentPath,
          [AccessorKey.Index({ index }), localAccessor],
        ]);
      })
      .find(nonNull) || null
  );
}

function getDestructuredObjectBindingAssignmentTargetReference(
  targetVariable: NodePath<ObjectPattern>,
  identifier: NodePath<Identifier>,
  parentPath: Array<[AccessorKey, NodePath<PatternLike>]>,
): Reference | null {
  const { namedProperties, restElement } = targetVariable.get('properties').reduce(
    (state, property) => {
      if (property.isRestElement()) {
        state.restElement = property;
      } else if (property.isObjectProperty()) {
        const propertyKey = createPropertyKey(property.get('key'), property.node.computed);
        if (propertyKey) state.namedProperties.push([propertyKey, property]);
      }
      return state;
    },
    {
      namedProperties: new Array<[AccessorKey, NodePath<ObjectProperty>]>(),
      restElement: null as NodePath<RestElement> | null,
    },
  );
  const namedPropertyReference = namedProperties
    .map(([propertyKey, property]) => {
      const variableName = property.get('value');
      if (!variableName.isPatternLike()) return null;
      return getBindingAssignmentTargetReference(variableName, identifier, [
        ...parentPath,
        [propertyKey, variableName],
      ]);
    })
    .find(nonNull);
  if (namedPropertyReference) return namedPropertyReference;
  if (!restElement) return null;
  const namedPropertyKeys = namedProperties.map(([propertyKey]) => propertyKey);
  return getBindingAssignmentTargetReference(restElement, identifier, [
    ...parentPath,
    [AccessorKey.ObjectRest({ excluded: namedPropertyKeys }), restElement],
  ]);
}

function getDestructuredRestBindingAssignmentTargetReference(
  targetVariable: NodePath<RestElement>,
  local: NodePath<Identifier>,
  parentPath: Array<[AccessorKey, NodePath<PatternLike>]>,
): Reference | null {
  return getBindingAssignmentTargetReference(targetVariable.get('argument'), local, parentPath);
}

function getBindingInitializers(
  binding: Binding,
  identifier: NodePath<Identifier>,
): Array<NodePath<Expression | ObjectMethod>> {
  switch (binding.kind) {
    case 'var':
    case 'let':
    case 'const':
      if (!binding.path.isVariableDeclarator()) return [];
      const assignmentTarget = stripTypeScriptAnnotations(binding.path.get('id'));
      if (!assignmentTarget.isPatternLike()) return [];
      const initializer = getOptionalNodeFieldValue(binding.path.get('init'));
      return getDestructuredVariableDeclarationInitializers(
        assignmentTarget,
        identifier,
        initializer ? [stripTypeScriptAnnotations(initializer)] : [],
      );
    case 'module':
    case 'param':
      // FIXME: support default parameter initializers
      return [];
    case 'local':
    case 'hoisted':
    case 'unknown':
      return [];
  }
}

function getDestructuredVariableDeclarationInitializers(
  assignmentTarget: NodePath<PatternLike>,
  identifier: NodePath<Identifier>,
  initializers: Array<NodePath<Expression | ObjectMethod>>,
): Array<NodePath<Expression | ObjectMethod>> {
  if (assignmentTarget.isIdentifier()) {
    if (assignmentTarget.node.name !== identifier.node.name) return [];
    return initializers;
  }
  if (assignmentTarget.isAssignmentPattern()) {
    const localAccessor = stripTypeScriptAnnotations(assignmentTarget.get('left'));
    if (!localAccessor.isPatternLike()) return [];
    const defaultValue = stripTypeScriptAnnotations(assignmentTarget.get('right'));
    return getDestructuredVariableDeclarationInitializers(localAccessor, identifier, [
      defaultValue,
      ...initializers,
    ]);
  }
  if (assignmentTarget.isObjectPattern()) {
    return assignmentTarget.get('properties').flatMap((property) => {
      if (property.isObjectProperty()) {
        const localAccessor = property.get('value');
        if (!localAccessor.isPatternLike()) return [];
        const propertyKey = createPropertyKey(
          stripTypeScriptAnnotations(property.get('key')),
          property.node.computed,
        );
        return getDestructuredVariableDeclarationInitializers(
          localAccessor,
          identifier,
          propertyKey
            ? initializers
                .map((initializer) => {
                  if (!initializer.isObjectExpression()) return null;
                  return getNamedObjectLiteralStaticPropertyValue(initializer, propertyKey);
                })
                .filter(nonNull)
            : [],
        );
      }
      if (property.isRestElement()) {
        const localAccessor = property.get('argument');
        if (!localAccessor.isPatternLike()) return [];
        return getDestructuredVariableDeclarationInitializers(
          localAccessor,
          identifier,
          initializers,
        );
      }
      return [];
    });
  }
  if (assignmentTarget.isArrayPattern()) {
    // FIXME: support array destructuring binding initializers
    return [];
  }
  if (assignmentTarget.isRestElement()) {
  }
  return [];
}

export function getAccessorExpressionPaths(
  expression: NodePath<Expression>,
): Array<AccessorPath> | null {
  const desugaredExpression = stripTypeScriptAnnotations(expression);
  if (desugaredExpression !== expression) return getAccessorExpressionPaths(desugaredExpression);
  if (expression.isIdentifier()) return getIdentifierAccessorPaths(expression);
  if (expression.isMemberExpression()) return getMemberExpressionAccessorPaths(expression);
  if (expression.isAssignmentExpression()) {
    return getAccessorExpressionPaths(expression.get('right'));
  }
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
  const key = createPropertyKey(property, computed);
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
        const key = createPropertyKey(targetProperty, computed);
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

export type TypeErased<T extends AstNode> = Exclude<
  T,
  | TSParameterProperty
  | TSInstantiationExpression
  | TSAsExpression
  | TSSatisfiesExpression
  | TSTypeAssertion
  | TSNonNullExpression
>;

export function stripTypeScriptAnnotations(
  expression: NodePath<PatternLike>,
): NodePath<TypeErased<PatternLike>>;
export function stripTypeScriptAnnotations(expression: NodePath<LVal>): NodePath<TypeErased<LVal>>;
export function stripTypeScriptAnnotations(
  expression: NodePath<OptionalMemberExpression | LVal>,
): NodePath<TypeErased<OptionalMemberExpression | LVal>>;
export function stripTypeScriptAnnotations(
  expression: NodePath<Expression>,
): NodePath<TypeErased<Expression>>;
export function stripTypeScriptAnnotations(
  expression: NodePath<Expression | PrivateName>,
): NodePath<TypeErased<Expression | PrivateName>>;
export function stripTypeScriptAnnotations(
  expression: NodePath<Expression | PatternLike>,
): NodePath<TypeErased<Expression | PatternLike>>;
export function stripTypeScriptAnnotations(
  expression: NodePath<AstNode>,
): NodePath<TypeErased<AstNode>> {
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
  return expression as NodePath<TypeErased<AstNode>>;
}

export function getTypeErasedParent(
  expression: NodePath<AstNode>,
): NodePath<TypeErased<AstNode>> | null {
  if (!expression.parentPath) return null;
  if (expression.parentPath.isTSInstantiationExpression()) {
    return getTypeErasedParent(expression.parentPath);
  }
  if (expression.parentPath.isTSAsExpression()) {
    return getTypeErasedParent(expression.parentPath);
  }
  if (expression.parentPath.isTSSatisfiesExpression()) {
    return getTypeErasedParent(expression.parentPath);
  }
  if (expression.parentPath.isTSTypeAssertion()) {
    return getTypeErasedParent(expression.parentPath);
  }
  if (expression.parentPath.isTSNonNullExpression()) {
    return getTypeErasedParent(expression.parentPath);
  }
  return expression.parentPath as NodePath<TypeErased<AstNode>>;
}
