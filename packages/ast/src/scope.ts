import { Enum, EnumVariant, match, nonNull } from '@ag-grid-devtools/utils';
import type {
  ArrayPattern,
  ArrowFunctionExpression,
  AssignmentExpression,
  AssignmentPattern,
  Class,
  ClassPrivateProperty,
  Expression,
  FunctionDeclaration,
  FunctionParent,
  Identifier,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  Literal,
  LVal,
  MemberExpression,
  Method,
  ObjectExpression,
  ObjectMethod,
  ObjectPattern,
  ObjectProperty,
  OptionalMemberExpression,
  PatternLike,
  PrivateName,
  Property,
  RestElement,
  TSAsExpression,
  TSInstantiationExpression,
  TSNonNullExpression,
  TSParameterProperty,
  TSSatisfiesExpression,
  TSTypeAssertion,
  VariableDeclarator,
} from '@babel/types';

import {
  createPropertyKey,
  createStaticPropertyKey,
  getLiteralPropertyKey,
  getNamedObjectLiteralStaticProperty,
  getNamedObjectLiteralStaticPropertyValue,
  getNamedObjectPatternStaticProperties,
  getNamedObjectPatternStaticPropertyValues,
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

export type ReferenceNode = TypeErased<LVal> | OptionalMemberExpression;
export type ReferenceValueNode = TypeErased<Expression> | ObjectMethod | FunctionDeclaration;

export type Reference = Enum<{
  BindingDeclaration: {
    path: NodePath<PatternLike>;
    declaration: NodePath<VariableDeclarator> | null;
    accessorPath: {
      root: NodePath<PatternLike>;
      path: Array<DestructuringAccessor>;
    };
  };
  VariableGetter: {
    path: NodePath<Identifier>;
  };
  VariableSetter: {
    path: NodePath<Identifier>;
    assignment: NodePath<AssignmentExpression>;
  };
  FunctionDeclaration: {
    path: NodePath<FunctionDeclaration>;
  };
  ModuleImport: {
    path: NodePath<Identifier>;
    imported: NodePath<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>;
  };
  PropertyGetter: {
    path: NodePath<MemberExpression | OptionalMemberExpression>;
  };
  PropertySetter: {
    path: NodePath<MemberExpression | OptionalMemberExpression>;
    assignment: NodePath<AssignmentExpression>;
  };
}>;

export const Reference = Enum.create<Reference>({
  BindingDeclaration: true,
  VariableGetter: true,
  VariableSetter: true,
  FunctionDeclaration: true,
  ModuleImport: true,
  PropertyGetter: true,
  PropertySetter: true,
});

export type BindingDeclarationReference = EnumVariant<Reference, 'BindingDeclaration'>;
export type VariableGetterReference = EnumVariant<Reference, 'VariableGetter'>;
export type VariableSetterReference = EnumVariant<Reference, 'VariableSetter'>;
export type FunctionDeclarationReference = EnumVariant<Reference, 'FunctionDeclaration'>;
export type ModuleImportReference = EnumVariant<Reference, 'ModuleImport'>;
export type PropertyGetterReference = EnumVariant<Reference, 'PropertyGetter'>;
export type PropertySetterReference = EnumVariant<Reference, 'PropertySetter'>;

type VariableReference = VariableGetterReference | VariableSetterReference;

type PropertyReference = PropertyGetterReference | PropertySetterReference;

export type DestructuringAccessor = Enum<{
  Object: {
    key: AccessorKey;
    property: ObjectDestructuringAccessor;
  };
  Array: {
    key: AccessorKey;
    element: NodePath<PatternLike>;
  };
}>;

export const DestructuringAccessor = Enum.create<DestructuringAccessor>({
  Object: true,
  Array: true,
});

export type ObjectDestructuringAccessor = Enum<{
  Property: {
    node: NodePath<ObjectProperty>;
  };
  Rest: {
    node: NodePath<RestElement>;
  };
}>;

export const ObjectDestructuringAccessor = Enum.create<ObjectDestructuringAccessor>({
  Property: true,
  Rest: true,
});

export function generateUniqueScopeBinding(scope: Scope, name: string): Identifier {
  return scope.hasBinding(name) ? scope.generateUidIdentifier(name) : t.identifier(name);
}

export function isReferenceNode(
  expression: NodePath<AstNode>,
): expression is NodePath<ReferenceNode> {
  return expression.isLVal() || expression.isOptionalMemberExpression();
}

export function getReferenceTarget(target: NodePath<ReferenceNode>): Reference | null {
  if (target.isAssignmentPattern()) {
    const localAssignment = stripTypeScriptAnnotations(target.get('left'));
    return getReferenceTarget(localAssignment);
  }
  if (target.isIdentifier()) {
    const parent = getTypeErasedParent(target);
    if (parent && parent.isAssignmentExpression()) {
      // FIXME: support nested assignments
      return Reference.VariableSetter({ path: target, assignment: parent });
    } else {
      return Reference.VariableGetter({ path: target });
    }
  }
  if (target.isMemberExpression() || target.isOptionalMemberExpression()) {
    const parent = getTypeErasedParent(target);
    if (parent && parent.isAssignmentExpression()) {
      // FIXME: support nested assignments
      return Reference.PropertySetter({ path: target, assignment: parent });
    } else {
      return Reference.PropertyGetter({ path: target });
    }
  }
  if (target.isPatternLike()) {
    // FIXME: support nested destructuring identifiers
    // FIXME: support destructured array rest elements: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#using_a_binding_pattern_as_the_rest_property
    return Reference.BindingDeclaration({
      path: target,
      declaration: null,
      accessorPath: { root: target, path: [] },
    });
  }
  return null;
}

export function findReferences(target: Reference): Array<Reference> {
  return match(target, {
    // If the local accessor is a binding declaration, return all the other references to the bound variable
    BindingDeclaration: (ref) => getBindingDeclarationReferences(ref),
    // If the local accessor is an alias to a variable, return all the other references to that variable
    VariableGetter: (ref) => getVariableReferences(ref),
    VariableSetter: (ref) => getVariableReferences(ref),
    // If the local accessor is an alias to a hoisted function, return all the other references to that function
    FunctionDeclaration: (ref) => getFunctionDeclarationReferences(ref),
    // If the local accessor is an alias to an imported module, return all the other references to that variable
    ModuleImport: (ref) => getModuleImportReferences(ref),
    // If the local accessor is an object property accessor, return all the other references to that object property
    PropertyGetter: (ref) => getPropertyAccessorReferences(ref),
    PropertySetter: (ref) => getPropertyAccessorReferences(ref),
  });
}

function getVariableReferences(reference: VariableReference): Array<Reference> {
  const { path: identifier } = reference;
  return getLocalVariableReferences(identifier);
}

function getModuleImportReferences(reference: ModuleImportReference): Array<Reference> {
  const { path: identifier } = reference;
  return getLocalVariableReferences(identifier);
}

function getLocalVariableReferences(identifier: NodePath<Identifier>): Array<Reference> {
  const binding = identifier.scope.getBinding(identifier.node.name);
  if (!binding) return [];
  const declaration = getBindingTargetReference(binding, identifier);
  const assignments = binding.constantViolations
    .map((path) => {
      if (!path.isAssignmentExpression()) return null;
      const assignmentTarget = stripTypeScriptAnnotations(path.get('left'));
      if (assignmentTarget.isIdentifier() && assignmentTarget.node.name === identifier.node.name) {
        return Reference.VariableSetter({ path: assignmentTarget, assignment: path });
      }
      return null;
    })
    .filter(nonNull);
  const accessors = binding.referencePaths
    .map((path) => (path.isIdentifier() ? path : null))
    .filter(nonNull)
    .flatMap((accessor) => {
      const assignmentTarget = getValueAssignmentTarget(accessor);
      const assignmentReference = assignmentTarget && getReferenceTarget(assignmentTarget);
      return [
        Reference.VariableGetter({ path: accessor }),
        ...(assignmentReference ? findReferences(assignmentReference) : []),
      ];
    });
  return [...(declaration ? [declaration] : []), ...assignments, ...accessors];
}

function getBindingTargetReference(
  binding: Binding,
  identifier: NodePath<Identifier>,
): Reference | null {
  switch (binding.kind) {
    case 'var':
    case 'let':
    case 'const':
      // FIXME: support referencing variables declared in destructuring patterns
      if (!binding.path.isVariableDeclarator()) return null;
      const targetAccessor = binding.path.get('id');
      const patternRoot = targetAccessor.isPatternLike() ? targetAccessor : null;
      if (!patternRoot) return null;
      return getBindingAssignmentTargetReference(
        targetAccessor,
        identifier,
        binding.path,
        patternRoot,
        [],
      );
    case 'module':
      if (binding.path.isImportSpecifier()) {
        return Reference.ModuleImport({ path: binding.path.get('local'), imported: binding.path });
      }
      if (binding.path.isImportDefaultSpecifier()) {
        return Reference.ModuleImport({ path: binding.path.get('local'), imported: binding.path });
      }
      if (binding.path.isImportNamespaceSpecifier()) {
        return Reference.ModuleImport({ path: binding.path.get('local'), imported: binding.path });
      }
      return null;
    case 'param':
    case 'local':
      // FIXME: support destructured parameters and default parameter initializers
      if (binding.path.isIdentifier()) return Reference.VariableGetter({ path: binding.path });
      return null;
    case 'hoisted':
      if (binding.path.isFunctionDeclaration()) {
        return Reference.FunctionDeclaration({ path: binding.path });
      }
      return null;
    case 'unknown':
      if (binding.path.isIdentifier()) return Reference.VariableGetter({ path: binding.path });
      return null;
  }
}

function getBindingAssignmentTargetReference(
  targetVariable: NodePath<LVal>,
  identifier: NodePath<Identifier>,
  declaration: NodePath<VariableDeclarator>,
  patternRoot: NodePath<PatternLike>,
  parentPath: Array<DestructuringAccessor>,
): Reference | null {
  if (targetVariable.isIdentifier()) {
    return getIdentifierBindingAssignmentTargetReference(
      targetVariable,
      identifier,
      declaration,
      patternRoot,
      parentPath,
    );
  }
  if (targetVariable.isAssignmentPattern()) {
    return getDefaultedBindingAssignmentTargetReference(
      targetVariable,
      identifier,
      declaration,
      patternRoot,
      parentPath,
    );
  }
  if (targetVariable.isObjectPattern()) {
    return getDestructuredObjectBindingAssignmentTargetReference(
      targetVariable,
      identifier,
      declaration,
      patternRoot,
      parentPath,
    );
  }
  if (targetVariable.isArrayPattern()) {
    return getDestructuredArrayBindingAssignmentTargetReference(
      targetVariable,
      identifier,
      declaration,
      patternRoot,
      parentPath,
    );
  }
  if (targetVariable.isRestElement()) {
    return getDestructuredRestBindingAssignmentTargetReference(
      targetVariable,
      identifier,
      declaration,
      patternRoot,
      parentPath,
    );
  }
  return null;
}

function getIdentifierBindingAssignmentTargetReference(
  targetVariable: NodePath<Identifier>,
  identifier: NodePath<Identifier>,
  declaration: NodePath<VariableDeclarator>,
  patternRoot: NodePath<PatternLike>,
  parentPath: Array<DestructuringAccessor>,
): Reference | null {
  if (targetVariable.node.name !== identifier.node.name) return null;
  return Reference.BindingDeclaration({
    path: targetVariable,
    declaration,
    accessorPath: {
      root: patternRoot,
      path: parentPath,
    },
  });
}

function getDefaultedBindingAssignmentTargetReference(
  targetVariable: NodePath<AssignmentPattern>,
  identifier: NodePath<Identifier>,
  declaration: NodePath<VariableDeclarator>,
  patternRoot: NodePath<PatternLike>,
  parentPath: Array<DestructuringAccessor>,
): Reference | null {
  return getBindingAssignmentTargetReference(
    targetVariable.get('left'),
    identifier,
    declaration,
    patternRoot,
    parentPath,
  );
}

function getDestructuredArrayBindingAssignmentTargetReference(
  targetVariable: NodePath<ArrayPattern>,
  identifier: NodePath<Identifier>,
  declaration: NodePath<VariableDeclarator>,
  patternRoot: NodePath<PatternLike>,
  parentPath: Array<DestructuringAccessor>,
): Reference | null {
  return (
    targetVariable
      .get('elements')
      .map((element, index) => {
        const localAccessor = getOptionalNodeFieldValue(element);
        if (!localAccessor || !localAccessor.isPatternLike()) return null;
        if (localAccessor.isRestElement()) {
          return getBindingAssignmentTargetReference(
            localAccessor,
            identifier,
            declaration,
            patternRoot,
            [
              ...parentPath,
              DestructuringAccessor.Array({
                key: AccessorKey.ArrayRest({ startIndex: index }),
                element: localAccessor,
              }),
            ],
          );
        }
        return getBindingAssignmentTargetReference(
          localAccessor,
          identifier,
          declaration,
          patternRoot,
          [
            ...parentPath,
            DestructuringAccessor.Array({
              key: AccessorKey.Index({ index }),
              element: localAccessor,
            }),
          ],
        );
      })
      .find(nonNull) || null
  );
}

function getDestructuredObjectBindingAssignmentTargetReference(
  targetVariable: NodePath<ObjectPattern>,
  identifier: NodePath<Identifier>,
  declaration: NodePath<VariableDeclarator>,
  patternRoot: NodePath<PatternLike>,
  parentPath: Array<DestructuringAccessor>,
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
      return getBindingAssignmentTargetReference(
        variableName,
        identifier,
        declaration,
        patternRoot,
        [
          ...parentPath,
          DestructuringAccessor.Object({
            key: propertyKey,
            property: ObjectDestructuringAccessor.Property({ node: property }),
          }),
        ],
      );
    })
    .find(nonNull);
  if (namedPropertyReference) return namedPropertyReference;
  if (!restElement) return null;
  const namedPropertyKeys = namedProperties.map(([propertyKey]) => propertyKey);
  return getBindingAssignmentTargetReference(restElement, identifier, declaration, patternRoot, [
    ...parentPath,
    DestructuringAccessor.Object({
      key: AccessorKey.ObjectRest({ excluded: namedPropertyKeys }),
      property: ObjectDestructuringAccessor.Rest({ node: restElement }),
    }),
  ]);
}

function getDestructuredRestBindingAssignmentTargetReference(
  targetVariable: NodePath<RestElement>,
  identifier: NodePath<Identifier>,
  declaration: NodePath<VariableDeclarator>,
  patternRoot: NodePath<PatternLike>,
  parentPath: Array<DestructuringAccessor>,
): Reference | null {
  return getBindingAssignmentTargetReference(
    targetVariable.get('argument'),
    identifier,
    declaration,
    patternRoot,
    parentPath,
  );
}

function getValueAssignmentTarget(target: NodePath<Expression>): NodePath<ReferenceNode> | null {
  const expression = stripTypeScriptAnnotations(target);
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

function getBindingDeclarationReferences(reference: BindingDeclarationReference): Array<Reference> {
  const { path: target } = reference;
  // If this is a fully-specified variable binding, return the declaration and all references to the bound variable
  if (target.isIdentifier()) return [reference, ...getLocalVariableReferences(target)];
  // Otherwise if this is only a partial binding declaration (i.e. an intermediate key within a destructuring pattern),
  // there can be no further references to the current stage of the declaration pattern
  return [reference];
}

function getPropertyAccessorReferences(reference: PropertyReference): Array<Reference> {
  const { path: target } = reference;
  const object = stripTypeScriptAnnotations(target.get('object'));
  const key = stripTypeScriptAnnotations(target.get('property'));
  const computed = target.node.computed;
  return getObjectPropertyReferences(object, key.node, computed);
}

export function getObjectPropertyReferences(
  target: NodePath<Expression>,
  key: Expression | PrivateName,
  computed: boolean,
): Array<Reference> {
  const propertyKey = createStaticPropertyKey(key, computed);
  if (!propertyKey) return [];
  const targetReference = isReferenceNode(target) ? getReferenceTarget(target) : null;
  if (!targetReference) return [];
  const targetReferences = findReferences(targetReference);
  return targetReferences.flatMap((objectReference) => {
    return match(objectReference, {
      // If this is a destructuring pattern, drill into the pattern to retrieve references to the given property
      BindingDeclaration: (ref) =>
        getBindingDeclarationPropertyReferences(ref, key, computed, propertyKey),
      // If this is a variable or property accessor, analyze the surrounding property-chaining expression for references to the given property
      VariableGetter: (ref) => getAccessorPropertyReferences(ref, propertyKey),
      VariableSetter: (ref) => getAccessorPropertyReferences(ref, propertyKey),
      PropertyGetter: (ref) => getAccessorPropertyReferences(ref, propertyKey),
      PropertySetter: (ref) => getAccessorPropertyReferences(ref, propertyKey),
      // Function declarations cannot be drilled into any further
      FunctionDeclaration: (ref) => [],
      // Module imports cannot be drilled into any further
      ModuleImport: (ref) => [],
    });
  });
}

function getAccessorPropertyReferences(
  reference: VariableReference | PropertyReference,
  propertyKey: AccessorKey,
): Array<Reference> {
  return getNamedPropertyAccessorReferences(reference.path, propertyKey);
}

function getNamedPropertyAccessorReferences(
  expression: NodePath<Expression>,
  propertyKey: AccessorKey,
): Array<Reference> {
  const parent = getTypeErasedParent(expression);
  if (!parent || !parent.isMemberExpression()) return [];
  const accessorProperty = stripTypeScriptAnnotations(parent.get('property'));
  const accessorComputed = parent.node.computed;
  const accessorKey = createPropertyKey(accessorProperty, accessorComputed);
  if (!accessorKey || !areAccessorKeysEqual(propertyKey, accessorKey)) return [];
  const grandparent = getTypeErasedParent(parent);
  if (grandparent && grandparent.isAssignmentExpression()) {
    const assignment = Reference.PropertySetter({ path: parent, assignment: grandparent });
    return [assignment];
  }
  return [Reference.PropertyGetter({ path: parent })];
}

function getBindingDeclarationPropertyReferences(
  reference: BindingDeclarationReference,
  key: Expression | PrivateName,
  computed: boolean,
  propertyKey: AccessorKey,
): Array<Reference> {
  // If this is a partial destructuring expression, traverse inside the pattern to retrieve matching child property patterns
  if (reference.path.isObjectPattern())
    return getObjectDestructuringBindingDeclarationPropertyReferences(
      reference.path,
      reference,
      key,
      computed,
      propertyKey,
    );
  // FIXME: Support traversing indexed properties within destructured array initializers
  if (reference.path.isArrayPattern()) return [];
  return [];
}

function getObjectDestructuringBindingDeclarationPropertyReferences(
  objectPattern: NodePath<ObjectPattern>,
  reference: BindingDeclarationReference,
  key: Expression | PrivateName,
  computed: boolean,
  propertyKey: AccessorKey,
): Array<Reference> {
  const namedProperties = getNamedObjectPatternStaticProperties(objectPattern, propertyKey);
  const namedPropertyReferences = namedProperties.flatMap((property) => {
    const localAccessor = property.get('value');
    if (!localAccessor.isPatternLike()) return [];
    return [
      Reference.BindingDeclaration({
        path: localAccessor,
        declaration: reference.declaration,
        accessorPath: {
          root: reference.accessorPath.root,
          path: [
            ...reference.accessorPath.path,
            DestructuringAccessor.Object({
              key: propertyKey,
              property: ObjectDestructuringAccessor.Property({ node: property }),
            }),
          ],
        },
      }),
      // If this is a fully-specified variable binding, return all references to the bound variable
      ...(localAccessor.isIdentifier()
        ? getLocalVariableReferences(localAccessor)
            // Filter out the unqualified local variable binding, as this will be covered by the fully-qualified binding declaration
            .filter((reference) => reference.path.node !== localAccessor.node)
        : []),
    ];
  });
  // If the destructuring expression specifies a rest parameter, traverse inside the rest parameter to retrieve matching child property patterns
  const restPropertyReferences =
    (() => {
      const restProperty =
        objectPattern
          .get('properties')
          .map((property) => (property.isRestElement() ? property : null))
          .find(nonNull) || null;
      if (!restProperty) return null;
      const localRestAccessor = restProperty.get('argument');
      // If the rest property specifies a default value, traverse inside the default value
      if (localRestAccessor.isAssignmentPattern()) {
        const target = localRestAccessor.get('left');
        const defaultValue = localRestAccessor.get('right');
        const targetReferences = target.isExpression()
          ? getObjectPropertyReferences(target, key, computed)
          : [];
        const defaultValueReferences = getObjectPropertyReferences(defaultValue, key, computed);
        return [...targetReferences, ...defaultValueReferences];
      } else if (localRestAccessor.isIdentifier()) {
        const targetReferences = getObjectPropertyReferences(localRestAccessor, key, computed);
        return targetReferences;
      } else {
        return null;
      }
    })() || [];
  return [...namedPropertyReferences, ...restPropertyReferences];
}

function getFunctionDeclarationReferences(
  reference: FunctionDeclarationReference,
): Array<Reference> {
  const { path: target } = reference;
  const functionName = target.node.id;
  const binding = functionName ? target.scope.getBinding(functionName.name) : null;
  if (!functionName || !binding) return [];
  const declaration = binding.path.isFunctionDeclaration()
    ? Reference.FunctionDeclaration({ path: binding.path })
    : null;
  const assignments = binding.constantViolations
    .map((path) => {
      if (!path.isAssignmentExpression()) return null;
      const assignmentTarget = stripTypeScriptAnnotations(path.get('left'));
      if (assignmentTarget.isIdentifier() && assignmentTarget.node.name === functionName.name) {
        return Reference.VariableSetter({ path: assignmentTarget, assignment: path });
      }
      return null;
    })
    .filter(nonNull);
  const accessors = binding.referencePaths
    .map((path) => {
      if (path.isIdentifier()) return Reference.VariableGetter({ path });
      return null;
    })
    .filter(nonNull);
  return [...(declaration ? [declaration] : []), ...assignments, ...accessors];
}

export function getReferenceValues(reference: Reference): Array<NodePath<ReferenceValueNode>> {
  return match(reference, {
    BindingDeclaration: (ref) => getBindingDeclarationValues(ref),
    VariableSetter: (ref) => {
      const { assignment } = ref;
      return [stripTypeScriptAnnotations(assignment.get('right'))];
    },
    PropertyGetter: (ref) => [],
    PropertySetter: (ref) => {
      const value = stripTypeScriptAnnotations(ref.assignment.get('right'));
      return value ? [value] : [];
    },
    FunctionDeclaration: (ref) => [ref.path],
    VariableGetter: (ref) => [],
    ModuleImport: (ref) => [],
  });
}

export function getObjectPropertyValues(
  object: NodePath<Expression>,
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): Array<NodePath<ReferenceValueNode>> {
  const target = stripTypeScriptAnnotations(object);
  if (target.isAssignmentExpression()) {
    const assignmentTarget = stripTypeScriptAnnotations(target.get('left'));
    const value = stripTypeScriptAnnotations(target.get('right'));
    const assignmentValues = assignmentTarget.isExpression()
      ? getObjectPropertyValues(assignmentTarget, key, computed)
      : [];
    const initializerValues = getObjectPropertyValues(value, key, computed);
    return [...assignmentValues, ...initializerValues];
  }
  if (target.isObjectExpression()) {
    const value = getObjectLiteralPropertyValue(target, key, computed);
    return value ? [value] : [];
  }
  if (target.isMemberExpression() || target.isOptionalMemberExpression()) {
    const parentObject = target.isMemberExpression()
      ? stripTypeScriptAnnotations(target.get('object'))
      : target.isOptionalMemberExpression()
      ? stripTypeScriptAnnotations(target.get('object'))
      : null;
    const parentKey = target.isMemberExpression()
      ? stripTypeScriptAnnotations(target.get('property'))
      : target.isOptionalMemberExpression()
      ? stripTypeScriptAnnotations(target.get('property'))
      : null;
    const parentComputed = target.node.computed;
    if (!parentObject || !parentKey) return [];
    return getObjectPropertyValues(parentObject, parentKey, parentComputed)
      .map((parentObject) => {
        if (parentObject.isExpression()) {
          return getObjectPropertyValues(parentObject, key, computed);
        }
        return null;
      })
      .filter(nonNull)
      .flat();
  }
  if (isReferenceNode(target)) {
    const objectReference = isReferenceNode(target) ? getReferenceTarget(target) : null;
    if (!objectReference) return [];
    return findReferences(objectReference).flatMap((reference) =>
      getReferenceValues(reference)
        .map((object) => {
          if (object.isObjectExpression()) {
            return getObjectLiteralPropertyValue(object, key, computed);
          }
          return null;
        })
        .filter(nonNull),
    );
  }
  return [];
}

function getObjectLiteralPropertyValue(
  object: NodePath<ObjectExpression>,
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): NodePath<ReferenceValueNode> | null {
  const propertyKey = createStaticPropertyKey(stripTypeScriptAnnotations(key).node, computed);
  const property = propertyKey && getNamedObjectLiteralStaticProperty(object, propertyKey);
  if (!property) return null;
  if (property.isObjectMethod()) return property;
  if (property.isObjectProperty()) {
    const value = property.get('value');
    if (!value.isExpression()) return null;
    return stripTypeScriptAnnotations(value);
  }
  return null;
}

function getBindingDeclarationValues(
  reference: BindingDeclarationReference,
): Array<NodePath<ReferenceValueNode>> {
  const { declaration, accessorPath } = reference;
  const ancestorInitializers = accessorPath.path.map(
    (property): [AccessorKey, NodePath<ReferenceValueNode> | null] => [
      property.key,
      getDestructuringAccessorInitializer(property),
    ],
  );
  const initValue = declaration ? getOptionalNodeFieldValue(declaration.get('init')) : null;
  const rootInitializer: NodePath<ReferenceValueNode> | null = initValue
    ? stripTypeScriptAnnotations(initValue)
    : null;
  return ancestorInitializers.reduce(
    (parentInitializers, [key, initializer]) => [
      ...(initializer ? [initializer] : []),
      ...parentInitializers.flatMap((parentInitializer) =>
        match(key, {
          Property: (key) => {
            if (!parentInitializer.isObjectExpression()) return [];
            const propertyValue = getNamedObjectLiteralStaticPropertyValue(parentInitializer, key);
            const value = propertyValue && stripTypeScriptAnnotations(propertyValue);
            return value ? [value] : [];
          },
          PrivateField: (key) => {
            if (!parentInitializer.isObjectExpression()) return [];
            const propertyValue = getNamedObjectLiteralStaticPropertyValue(parentInitializer, key);
            const value = propertyValue && stripTypeScriptAnnotations(propertyValue);
            return value ? [value] : [];
          },
          Index: ({ index }) => {
            if (!parentInitializer.isArrayExpression()) return [];
            const elements = parentInitializer.get('elements').slice(0, index + 1);
            if (elements.some((element) => element.isSpreadElement())) return [];
            const element = elements.length < index + 1 ? null : elements[elements.length - 1];
            const value =
              element && element.isExpression() ? stripTypeScriptAnnotations(element) : null;
            return value ? [value] : [];
          },
          Computed: ({ expression }) => [],
          ObjectRest: ({ excluded }) => {
            if (!parentInitializer.isObjectExpression()) return [];
            // FIXME: Support traversing within destructured object rest initializers
            return [];
          },
          ArrayRest: ({ startIndex }) => {
            if (!parentInitializer.isArrayExpression()) return [];
            if (startIndex === 0) return [parentInitializer];
            // FIXME: Support traversing within destructured array rest initializers
            return [];
          },
        }),
      ),
    ],
    rootInitializer ? [rootInitializer] : [],
  );
}

function getDestructuringAccessorInitializer(
  property: DestructuringAccessor,
): NodePath<ReferenceValueNode> | null {
  return match(property, {
    Object: ({ property }) =>
      match(property, {
        Property: ({ node }) => {
          const value = stripTypeScriptAnnotations(node.get('value'));
          if (!value.isAssignmentPattern()) return null;
          const initializer = stripTypeScriptAnnotations(value.get('right'));
          return initializer;
        },
        Rest: ({ node }) => null,
      }),
    Array: ({ element }) => {
      if (!element.isAssignmentPattern()) return null;
      const initializer = stripTypeScriptAnnotations(element.get('right'));
      return initializer;
    },
  });
}

function getDestructuredVariableDeclarationInitializers(
  assignmentTarget: NodePath<PatternLike>,
  identifier: NodePath<Identifier>,
  initializers: Array<NodePath<ReferenceValueNode>>,
): Array<NodePath<ReferenceValueNode>> {
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
                  const value = getNamedObjectLiteralStaticPropertyValue(initializer, propertyKey);
                  return value && stripTypeScriptAnnotations(value);
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
    // FIXME: support array accessorPath binding initializers
    return [];
  }
  if (assignmentTarget.isRestElement()) {
  }
  return [];
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
  expression: NodePath<Expression | ObjectMethod>,
): NodePath<TypeErased<Expression | ObjectMethod>>;
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

// function getBindingInitializers(
//   binding: Binding,
//   identifier: NodePath<Identifier>,
// ): Array<NodePath<ReferenceValueNode>> {
//   switch (binding.kind) {
//     case 'var':
//     case 'let':
//     case 'const':
//       if (!binding.path.isVariableDeclarator()) return [];
//       const assignmentTarget = stripTypeScriptAnnotations(binding.path.get('id'));
//       if (!assignmentTarget.isPatternLike()) return [];
//       const initializer = getOptionalNodeFieldValue(binding.path.get('init'));
//       return getDestructuredVariableDeclarationInitializers(
//         assignmentTarget,
//         identifier,
//         initializer ? [stripTypeScriptAnnotations(initializer)] : [],
//       );
//     case 'module':
//     case 'param':
//       // FIXME: support default parameter initializers
//       return [];
//     case 'local':
//     case 'hoisted':
//     case 'unknown':
//       return [];
//   }
// }

// export function getAccessorExpressionPaths(
//   expression: NodePath<Expression>,
// ): Array<AccessorPath> | null {
//   const desugaredExpression = stripTypeScriptAnnotations(expression);
//   if (desugaredExpression !== expression) return getAccessorExpressionPaths(desugaredExpression);
//   if (expression.isIdentifier()) return getIdentifierAccessorPaths(expression);
//   if (expression.isMemberExpression()) return getMemberExpressionAccessorPaths(expression);
//   if (expression.isAssignmentExpression()) {
//     return getAccessorExpressionPaths(expression.get('right'));
//   }
//   return [{ root: { target: expression, references: [] }, path: [] }];
// }

// function getMemberExpressionAccessorPaths(
//   expression: NodePath<MemberExpression>,
// ): Array<AccessorPath> | null {
//   const object = expression.get('object');
//   const property = expression.get('property');
//   const computed = expression.node.computed;
//   if (object.isThisExpression()) {
//     const classDefinition = getEnclosingClass(object);
//     if (!classDefinition) return null;
//     return getClassFieldAccessorPaths(classDefinition, expression);
//   }
//   const objectPaths = getAccessorExpressionPaths(object);
//   if (!objectPaths) return null;
//   const key = createPropertyKey(property, computed);
//   if (!key) return null;
//   return objectPaths.map(({ root, path }) => ({
//     root,
//     path: [...path, { key, references: [] }],
//   }));
// }

// export function getClassFieldAccessorPaths(
//   classDefinition: NodePath<Class | ObjectExpression>,
//   accessor: NodePath<MemberExpression | Property>,
// ): Array<AccessorPath> | null {
//   const key = accessor.isMemberExpression()
//     ? accessor.get('property')
//     : accessor.isProperty()
//     ? accessor.get('key')
//     : null;
//   const computed =
//     accessor.isMemberExpression() || (accessor.isProperty() && isPublicProperty(accessor))
//       ? accessor.node.computed
//       : false;
//   if (!key) return null;
//   // FIXME: avoid unnecessarily recomputing member accessor initializers for each reference
//   const accessors = findClassMemberAccessorExpressions(classDefinition, key, computed);
//   if (!accessors) return null;
//   const reference = AccessorReference.Property({ target: classDefinition, accessor });
//   const declarations = accessors
//     .map((accessor) => {
//       if (accessor.isProperty()) return accessor;
//       return null;
//     })
//     .filter(nonNull);
//   const initializers = declarations
//     .map((property) => {
//       const initializer = property.get('value');
//       if (!initializer.isExpression()) return null;
//       return initializer;
//     })
//     .filter(nonNull);
//   const reassignments = accessors
//     .map((accessor) => {
//       if (accessor.isMemberExpression()) {
//         // FIXME: support nested member expression assignments (e.g. this.foo.bar.baz = qux)
//         if (
//           accessor.parentPath.isAssignmentExpression() &&
//           accessor.parentPath.node.operator === '=' &&
//           accessor.parentPath.get('left').node === accessor.node &&
//           accessor.parentPath.get('right').node !== accessor.node
//         ) {
//           return accessor.parentPath.get('right');
//         }
//       }
//       return null;
//     })
//     .filter(nonNull);
//   const assignedValues = [...initializers, ...reassignments];
//   if (assignedValues.length === 0) {
//     return [
//       {
//         root: {
//           target: accessor,
//           references: [
//             ...declarations.map((property) =>
//               AccessorReference.Property({ target: classDefinition, accessor: property }),
//             ),
//             reference,
//           ],
//         },
//         path: [],
//       },
//     ];
//   }
//   return assignedValues
//     .flatMap((expression) => getAccessorExpressionPaths(expression) || [])
//     .map((accessorPath) => {
//       if (!reference) return accessorPath;
//       return registerAccessorPathReference(accessorPath, reference);
//     });
// }

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
      // Ignore unrelated object properties (e.g. in accessorPath patterns)
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

// function getIdentifierAccessorPaths(identifier: NodePath<Identifier>): Array<AccessorPath> | null {
//   const binding = identifier.scope.getBinding(identifier.node.name);
//   if (!binding) return null;
//   switch (binding.kind) {
//     case 'var':
//     case 'let':
//     case 'const':
//       if (!binding.path.isVariableDeclarator()) return null;
//       return getVariableAccessorPaths(binding, binding.path, identifier);
//     case 'module':
//     case 'hoisted':
//     case 'param':
//     case 'local':
//     case 'unknown':
//       return [
//         {
//           root: {
//             target: binding.path,
//             references: [AccessorReference.Local({ binding, accessor: identifier })],
//           },
//           path: [],
//         },
//       ];
//   }
// }

// function getVariableAccessorPaths(
//   binding: Binding,
//   declaration: NodePath<VariableDeclarator>,
//   accessor: NodePath<Identifier>,
// ): Array<AccessorPath> | null {
//   const variableName = accessor.node;
//   const propertyPath = getDestructuredPropertyPath(declaration.get('id'), variableName, {
//     path: [],
//     precedingSiblings: null,
//   });
//   if (!propertyPath) return null;
//   const reference = AccessorReference.Local({ binding, accessor });
//   const initializer = getOptionalNodeFieldValue(declaration.get('init'));
//   const reassignments = binding.constantViolations;
//   const assignedValues = [
//     ...(initializer ? [initializer] : []),
//     ...reassignments
//       .map((expression) => {
//         if (!expression.isAssignmentExpression() || expression.node.operator !== '=') return null;
//         const target = expression.get('left');
//         const value = expression.get('right');
//         if (target.isIdentifier() && target.node.name === variableName.name) return value;
//         // FIXME: support advanced assignment methods when determining accessor paths
//         return null;
//       })
//       .filter(nonNull),
//   ].flatMap((value) => {
//     const initializerAccessorPaths = getAccessorExpressionPaths(value);
//     if (!initializerAccessorPaths) return [];
//     return initializerAccessorPaths.map(({ root, path }) => {
//       const combinedAccessorPath: AccessorPath = {
//         root,
//         path: [...path, ...propertyPath.map((key) => ({ key, references: [] }))],
//       };
//       return registerAccessorPathReference(combinedAccessorPath, reference);
//     });
//   });
//   if (assignedValues.length === 0) {
//     return [{ root: { target: declaration, references: [reference] }, path: [] }];
//   }
//   return assignedValues;
// }

// interface AccessorParentPattern {
//   path: Array<AccessorKey>;
//   precedingSiblings: PrecedingObjectProperties | PrecedingArrayItems | null;
// }

// enum PrecedingFieldsType {
//   Object,
//   Array,
// }

// interface PrecedingFields<T extends PrecedingFieldsType> {
//   type: T;
// }

// interface PrecedingObjectProperties extends PrecedingFields<PrecedingFieldsType.Object> {
//   fields: Array<AccessorKey>;
// }

// interface PrecedingArrayItems extends PrecedingFields<PrecedingFieldsType.Array> {
//   count: number;
// }

// function getDestructuredPropertyPath(
//   propertyPath: NodePath<LVal>,
//   id: Identifier,
//   parentPattern: AccessorParentPattern,
// ): Array<AccessorKey> | null {
//   if (propertyPath.isIdentifier()) {
//     return propertyPath.node.name === id.name ? parentPattern.path : null;
//   }
//   if (propertyPath.isMemberExpression()) {
//     // FIXME: Support extended accessorPath syntax
//     return null;
//   }
//   if (propertyPath.isAssignmentPattern()) {
//     // FIXME: Expose default value initializers as variable assignments
//     return getDestructuredPropertyPath(propertyPath.get('left'), id, parentPattern);
//   }
//   if (propertyPath.isArrayPattern()) {
//     return getDestructuredArrayPropertyPath(propertyPath, id, parentPattern);
//   }
//   if (propertyPath.isObjectPattern()) {
//     return getDestructuredObjectPropertyPath(propertyPath, id, parentPattern);
//   }
//   if (propertyPath.isRestElement()) {
//     return getDestructuredRestPatternPropertyPath(propertyPath, id, parentPattern);
//   }
//   return null;
// }

// function getDestructuredRestPatternPropertyPath(
//   declaration: NodePath<RestElement>,
//   id: Identifier,
//   parentPattern: AccessorParentPattern,
// ): Array<AccessorKey> | null {
//   const { precedingSiblings } = parentPattern;
//   const identifier = declaration.get('argument');
//   const key: AccessorKey | null = !precedingSiblings
//     ? null
//     : precedingSiblings.type === PrecedingFieldsType.Array
//     ? AccessorKey.ArrayRest({ startIndex: precedingSiblings.count })
//     : precedingSiblings.type === PrecedingFieldsType.Object
//     ? AccessorKey.ObjectRest({ excluded: precedingSiblings.fields })
//     : null;
//   if (!key) return null;
//   return getDestructuredPropertyPath(identifier, id, {
//     path: [...parentPattern.path, key],
//     precedingSiblings: null,
//   });
// }

// function getDestructuredArrayPropertyPath(
//   declaration: NodePath<ArrayPattern>,
//   id: Identifier,
//   parentPattern: AccessorParentPattern,
// ): Array<AccessorKey> | null {
//   const matchingAccessorPathsForVariable = declaration.get('elements').reduce(
//     (acc, property) => {
//       const variableName = getOptionalNodeFieldValue(property);
//       if (!variableName) return acc;
//       if (variableName.isRestElement()) {
//         const restPattern = variableName.get('argument');
//         // FIXME: support destructured array rest elements: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#using_a_binding_pattern_as_the_rest_property
//         if (!restPattern.isIdentifier() || restPattern.node.name !== id.name) return acc;
//         const key = AccessorKey.ArrayRest({ startIndex: acc.numPrecedingSiblings });
//         const result = [...parentPattern.path, key];
//         acc.results.push(result);
//         return acc;
//       }
//       const key = AccessorKey.Index({ index: acc.numPrecedingSiblings });
//       const result = getDestructuredPropertyPath(variableName, id, {
//         path: [...parentPattern.path, key],
//         precedingSiblings: { type: PrecedingFieldsType.Array, count: acc.numPrecedingSiblings },
//       });
//       if (result) acc.results.push(result);
//       acc.numPrecedingSiblings++;
//       return acc;
//     },
//     {
//       results: new Array<Array<AccessorKey>>(),
//       numPrecedingSiblings: 0,
//     },
//   ).results;
//   if (matchingAccessorPathsForVariable.length === 0) return null;
//   const [accessorPath] = matchingAccessorPathsForVariable;
//   return accessorPath;
// }

// function getDestructuredObjectPropertyPath(
//   declaration: NodePath<ObjectPattern>,
//   id: Identifier,
//   parentPattern: AccessorParentPattern,
// ): Array<AccessorKey> | null {
//   const matchingAccessorPathsForVariable = declaration.get('properties').reduce(
//     (acc, property) => {
//       if (property.isRestElement()) {
//         const restIdentifier = property.get('argument');
//         if (!restIdentifier.isIdentifier() || restIdentifier.node.name !== id.name) return acc;
//         const key = AccessorKey.ObjectRest({ excluded: acc.precedingProperties });
//         const result = [...parentPattern.path, key];
//         acc.results.push(result);
//         return acc;
//       }
//       if (property.isObjectProperty()) {
//         const targetProperty = property.get('key');
//         const computed = property.node.computed;
//         const key = createPropertyKey(targetProperty, computed);
//         if (!key) return acc;
//         const variableName = property.get('value');
//         // FIXME: Confirm object accessorPath syntax restrictions
//         if (!variableName.isLVal()) return acc;
//         const result = getDestructuredPropertyPath(variableName, id, {
//           path: [...parentPattern.path, key],
//           precedingSiblings: { type: PrecedingFieldsType.Object, fields: acc.precedingProperties },
//         });
//         if (result) acc.results.push(result);
//         acc.precedingProperties.push(key);
//         return acc;
//       }
//       return acc;
//     },
//     { results: new Array<Array<AccessorKey>>(), precedingProperties: new Array<AccessorKey>() },
//   ).results;
//   const accessorPath = matchingAccessorPathsForVariable[0] || null;
//   return accessorPath;
// }

// function registerAccessorPathReference(
//   accessor: AccessorPath,
//   reference: AccessorReference,
// ): AccessorPath {
//   const { root, path } = accessor;
//   if (path.length > 0) {
//     return {
//       root,
//       path: [
//         ...path.slice(0, -1),
//         {
//           key: path[path.length - 1].key,
//           references: [reference, ...path[path.length - 1].references],
//         },
//       ],
//     };
//   } else {
//     return {
//       root: {
//         target: root.target,
//         references: [reference, ...root.references],
//       },
//       path,
//     };
//   }
// }
