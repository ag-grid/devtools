import {
  AG_GRID_JS_CONSTRUCTOR_EXPORT_NAME,
  AccessorKey,
  AccessorReference,
  ImportedModuleMatcher,
  TransformContext,
  areAccessorKeysEqual,
  getAccessorExpressionPaths,
  getNamedModuleImportExpression,
  getOptionalNodeFieldValue,
  getStaticPropertyKey,
  pattern,
  node as t,
  type AccessorPath,
  type AstCliContext,
  type AstNode,
  type AstNodeVisitor,
  type AstTransformContext,
  type FsContext,
  type NodePath,
  type Types,
} from '@ag-grid-devtools/ast';
import {
  Enum,
  nonNull,
  unreachable,
  type EnumOptions,
  type EnumVariant,
} from '@ag-grid-devtools/utils';

import {
  Angular,
  findNamedAngularTemplateElements,
  getAngularComponentDataFieldReferences,
  getAngularViewChildMetadata,
  getAngularComponentPropertyReadExpression,
  getAngularTemplateNodeChild,
  isNamedAngularComponentMethodCallExpression,
  isTypedAngularTemplateNode,
  parseAngularComponentTemplate,
  updateAngularComponentTemplate,
  type AngularTemplateNode,
  type TmplAST,
} from './angularHelpers';
import { Events } from './eventKeys';
import { REACT_REF_VALUE_ACCESSOR_NAME, getReactBoundElementRef } from './reactHelpers';
import { findTemplateNodes, printTemplate } from './templateHelpers';
import {
  getVueComponentComponentDeclarations,
  getVueComponentDataFieldReferences,
  getVueComponentTemplateProperty,
  getVueComponentTemplateSource,
  getVueElementEventHandlerDirectiveName,
  getVueElementEventHandlerDirectives,
  getVueTemplateNodeChild,
  matchVueComponentMethod,
  parseVueComponentTemplateSource,
  type AST,
  type VueTemplateNode,
  VueTemplateFormatter,
} from './vueHelpers';
import { VueComponentCliContext } from './transform';

type AssignmentExpression = Types.AssignmentExpression;
type CallExpression = Types.CallExpression;
type OptionalCallExpression = Types.OptionalCallExpression;
type Class = Types.Class;
type ClassMethod = Types.ClassMethod;
type Expression = Types.Expression;
type Identifier = Types.Identifier;
type JSXAttribute = Types.JSXAttribute;
type JSXElement = Types.JSXElement;
type JSXExpressionContainer = Types.JSXExpressionContainer;
type JSXIdentifier = Types.JSXIdentifier;
type JSXSpreadAttribute = Types.JSXSpreadAttribute;
type MemberExpression = Types.MemberExpression;
type OptionalMemberExpression = Types.OptionalMemberExpression;
type ObjectExpression = Types.ObjectExpression;
type ObjectMethod = Types.ObjectMethod;
type ObjectProperty = Types.ObjectProperty;
type PrivateName = Types.PrivateName;

type Method = Types.ObjectMethod | Types.ClassMethod | Types.Function;

type VAttribute = AST.VAttribute;
type VDirective = AST.VDirective;
type VDirectiveKey = AST.VDirectiveKey;
type VElement = AST.VElement;
type VIdentifier = AST.VIdentifier;

export const AG_GRID_JS_UMD_GLOBAL_NAME = 'agGrid';

export const AG_GRID_JS_PACKAGE_NAME_PATTERN =
  /^(?:ag-grid-(?:community|enterprise)|@ag-grid-community\/core)$/;

export const AG_GRID_JS_PACKAGE_NAME_MATCHER: ImportedModuleMatcher = {
  importModulePattern: AG_GRID_JS_PACKAGE_NAME_PATTERN,
  importUmdPattern: AG_GRID_JS_UMD_GLOBAL_NAME,
  framework: 'vanilla',
};

const AG_GRID_REACT_PACKAGE_NAME_MATCHER: ImportedModuleMatcher = {
  importModulePattern: /^(?:ag-grid-react|@ag-grid-community\/react)$/,
  importUmdPattern: null,
  framework: 'react',
};
const AG_GRID_REACT_GRID_COMPONENT_NAME = 'AgGridReact';
const AG_GRID_REACT_GRID_OPTIONS_PROP_NAME = 'gridOptions';
const AG_GRID_REACT_API_ACCESSOR_NAME = 'api';
const AG_GRID_REACT_COLUMN_API_ACCESSOR_NAME = 'columnApi';

const AG_GRID_ANGULAR_PACKAGE_NAME_MATCHER: ImportedModuleMatcher = {
  importModulePattern: /^(?:ag-grid-angular|@ag-grid-community\/angular)$/,
  importUmdPattern: null,
  framework: 'angular',
};
const AG_GRID_ANGULAR_GRID_COMPONENT_NAME = 'AgGridAngular';
const AG_GRID_ANGULAR_ELEMENT_NAME = 'ag-grid-angular';
const AG_GRID_ANGULAR_GRID_OPTIONS_ATTRIBUTE_NAME = 'gridOptions';
const AG_GRID_ANGULAR_API_ACCESSOR_NAME = 'api';
const AG_GRID_ANGULAR_COLUMN_API_ACCESSOR_NAME = 'columnApi';

// FIXME: determine correct package names for vue2 vs vue3
const AG_GRID_VUE_PACKAGE_NAME_MATCHER: ImportedModuleMatcher = {
  importModulePattern: /^(?:ag-grid-vue3?|@ag-grid-community\/vue)$/,
  importUmdPattern: null,
  framework: 'vue',
};
const AG_GRID_VUE_GRID_COMPONENT_NAME = 'AgGridVue';
const AG_GRID_VUE_GRID_OPTIONS_ATTRIBUTE_NAME = 'gridOptions';
const AG_GRID_VUE_API_ACCESSOR_NAME = 'api';
const AG_GRID_VUE_COLUMN_API_ACCESSOR_NAME = 'columnApi';

const AG_GRID_EVENT_NAMES = Object.values(Events)
  .map((eventKey) => (typeof eventKey === 'string' ? eventKey : null))
  .filter(nonNull)
  .map(getFrameworkEventNames);

const AG_GRID_ANGULAR_EVENT_HANDLERS = new Set(AG_GRID_EVENT_NAMES.map(({ angular }) => angular));

const AG_GRID_VUE_EVENT_HANDLERS = new Set(AG_GRID_EVENT_NAMES.map(({ vue }) => vue));

export function getFrameworkEventNames(eventKey: string): {
  js: string;
  react: string;
  angular: string;
  vue: string;
} {
  return {
    js: `on${eventKey.charAt(0).toUpperCase()}${eventKey.slice(1)}`, // e.g. onGridReady
    react: `on${eventKey.charAt(0).toUpperCase()}${eventKey.slice(1)}`, // e.g. onGridReady
    angular: eventKey, // e.g. gridReady
    vue: eventKey.replace(/([a-zA-Z])([A-Z])/g, (_, prev, next) => `${prev}-${next.toLowerCase()}`), // e.g. grid-ready
  };
}

export type GridApiDefinition = Enum<{
  Js: {
    initializer: NodePath<Expression>;
    element: NodePath<Expression> | null;
    options: NodePath<Expression> | null;
  };
  React: {
    element: NodePath<JSXElement>;
    refAccessor: AccessorPath;
  };
  Angular: {
    component: NodePath<Class>;
    template: AngularTemplateNode<TmplAST>;
    element: AngularTemplateNode<Angular.TmplAstElement>;
    binding: Enum<{
      Element: {
        accessor: AccessorPath;
      };
      Event: {
        output: AngularTemplateNode<Angular.TmplAstBoundEvent>;
        handler: NodePath<ClassMethod>;
        eventAccessor: AccessorPath;
      };
    }>;
  };
  Vue: {
    component: NodePath<ObjectExpression>;
    template: VElement;
    element: VueTemplateNode<VElement>;
    directive: VueTemplateNode<VDirective>;
    handler: NodePath<Method>;
    eventAccessor: AccessorPath;
  };
}>;

export const GridApiDefinition = Enum.create<GridApiDefinition>({
  Js: true,
  React: true,
  Angular: true,
  Vue: true,
});

export type AngularGridApiBinding = EnumOptions<GridApiDefinition, 'Angular'>['binding'];

export const AngularGridApiBinding = Enum.create<AngularGridApiBinding>({
  Element: true,
  Event: true,
});

export type JsGridApiDefinition = EnumVariant<GridApiDefinition, 'Js'>;
export type ReactGridApiDefinition = EnumVariant<GridApiDefinition, 'React'>;
export type AngularGridApiDefinition = EnumVariant<GridApiDefinition, 'Angular'>;
export type VueGridApiDefinition = EnumVariant<GridApiDefinition, 'Vue'>;

export type PropertyInitializerNode = ObjectProperty | ObjectMethod;
export type PropertyAssignmentNode = AssignmentExpression & {
  left: MemberExpression | OptionalMemberExpression;
};
export type PropertyAccessorNode =
  | Identifier
  | MemberExpression
  | OptionalMemberExpression
  | ObjectProperty;

export function isPropertyInitializerNode(
  value: NodePath<AstNode>,
): value is NodePath<PropertyInitializerNode> {
  return (
    (value.isObjectProperty() && value.parentPath.isObjectExpression()) ||
    (value.isObjectMethod() && value.parentPath.isObjectExpression())
  );
}

export function isPropertyAssignmentNode(
  value: NodePath<AstNode>,
): value is NodePath<PropertyAssignmentNode> {
  if (!value.isAssignmentExpression()) return false;
  const left = value.get('left');
  return left.isMemberExpression() || left.isOptionalMemberExpression();
}

export function isPropertyAccessorNode(
  value: NodePath<AstNode>,
): value is NodePath<PropertyAccessorNode> {
  return (
    value.isIdentifier() ||
    value.isMemberExpression() ||
    value.isOptionalMemberExpression() ||
    (value.isObjectProperty() && value.parentPath.isObjectPattern())
  );
}

export interface ObjectPropertyVisitor<S> {
  init(path: NodePath<PropertyInitializerNode>, context: S): void;
  get(path: NodePath<PropertyAccessorNode>, context: S): void;
  set(path: NodePath<PropertyAssignmentNode>, context: S): void;
  jsxAttribute(path: NodePath<JSXAttribute>, element: NodePath<JSXElement>, context: S): void;
  angularAttribute(
    attributeNode: AngularTemplateNode<
      Angular.TmplAstTextAttribute | Angular.TmplAstBoundAttribute | Angular.TmplAstBoundEvent
    >,
    component: NodePath<Class>,
    element: AngularTemplateNode<Angular.TmplAstElement>,
    context: S,
  ): void;
  vueAttribute(
    attributeNode: VueTemplateNode<VAttribute | VDirective>,
    component: NodePath<ObjectExpression>,
    element: VueTemplateNode<VElement>,
    context: S,
  ): void;
}

export function visitObjectExpression<
  S extends AstTransformContext<AstCliContext & VueComponentCliContext>,
>(target: NodePath<Expression>, visitor: ObjectPropertyVisitor<S>, context: S): void {
  const accessors = getAccessorExpressionPaths(target);
  if (!accessors) return;
  accessors.forEach((accessor) => visitObjectAccessor(accessor, visitor, context));
}

export function visitGridOptionsProperties<
  S extends AstTransformContext<AstCliContext & VueComponentCliContext>,
>(visitor: ObjectPropertyVisitor<S>): AstNodeVisitor<S> {
  function CallExpression(path: NodePath, context: S) {
    const gridInitializer = matchJsGridApiInitializer(path, context);
    if (!gridInitializer) return;
    const { options } = gridInitializer;
    if (!options) return;
    const accessors = getAccessorExpressionPaths(options);
    if (!accessors) return;
    accessors.forEach((accessor) => visitObjectAccessor(accessor, visitor, context));
  }

  return {
    // Traverse plain JS grid API instances
    CallExpression,
    OptionalCallExpression: CallExpression,
    // Traverse React grid elements
    JSXElement(path, context) {
      if (!isAgGridJsxElement(path, context)) return;
      path
        .get('openingElement')
        .get('attributes')
        .forEach((attribute) => {
          // If this is the overall gridOptions attribute, traverse over the properties of the attribute value
          if (isAgGridJsxElementGridOptionsProp(attribute)) {
            const propValue = getJsxAttributeValue(attribute);
            // FIXME: warn if unable to parse gridOptions attribute value
            if (!propValue) return;
            const accessors = getAccessorExpressionPaths(propValue);
            if (!accessors) return;
            accessors.forEach((accessor) => visitObjectAccessor(accessor, visitor, context));
          } else if (attribute.isJSXAttribute()) {
            // Otherwise visit the individual attribute
            visitor.jsxAttribute(attribute, path, context);
          }
        });
    },
    // Traverse Angular grid components
    Class(path, context) {
      const templateDefinition = parseAngularComponentTemplate(path, context);
      if (!templateDefinition) return;
      const { template, metadata } = templateDefinition;
      const gridElements = findNamedAngularTemplateElements(template, AG_GRID_ANGULAR_ELEMENT_NAME);
      if (gridElements.length === 0) return;
      for (const element of gridElements) {
        const attributes = [
          ...getAngularTemplateNodeChild(element, 'attributes'),
          ...getAngularTemplateNodeChild(element, 'inputs'),
          ...getAngularTemplateNodeChild(element, 'outputs'),
        ];
        for (const attribute of attributes) {
          if (isTypedAngularTemplateNode(Angular.TmplAstTextAttribute, attribute)) {
            visitor.angularAttribute(attribute, path, element, context);
          } else if (isTypedAngularTemplateNode(Angular.TmplAstBoundAttribute, attribute)) {
            // If this is the overall gridOptions input, traverse over the properties of the bound value
            if (isAgGridAngularElementBoundGridOptionsInput(attribute)) {
              const boundComponentProperty = getAngularComponentPropertyReadExpression(
                attribute.node.value,
              );
              // FIXME: warn if unable to parse gridOptions attribute value
              if (!boundComponentProperty) return;
              const gridOptionsDataFieldReferences = getAngularComponentDataFieldReferences(
                path,
                boundComponentProperty.name,
              );
              const gridOptionsDataFieldAccessors = gridOptionsDataFieldReferences
                .map((accessor) => {
                  if (accessor.isExpression()) return accessor;
                  if (accessor.isClassProperty()) {
                    const value = getOptionalNodeFieldValue(accessor.get('value'));
                    if (value && value.isExpression()) return value;
                    return null;
                  }
                  return null;
                })
                .filter(nonNull)
                .flatMap((expression) => {
                  // FIXME: deduplicate Angular component data field accessors
                  return getAccessorExpressionPaths(expression) || [];
                });
              gridOptionsDataFieldAccessors.forEach((accessor) => {
                visitObjectAccessor(accessor, visitor, context);
              });
            } else {
              // Otherwise visit the individual attribute
              visitor.angularAttribute(attribute, path, element, context);
            }
          } else if (isTypedAngularTemplateNode(Angular.TmplAstBoundEvent, attribute)) {
            visitor.angularAttribute(attribute, path, element, context);
          }
        }
      }
      if (template.template.mutations.length > 0) {
        updateAngularComponentTemplate(metadata, template, context);
      }
    },
    // Traverse Vue grid components
    ObjectExpression(path, context) {
      const gridElementNames = matchAgGridVueComponentElementNames(path, context);
      if (!gridElementNames) return;
      const template = getVueComponentTemplate(path, context);
      if (!template) return;
      const gridElementNamesLookup = new Set(gridElementNames);
      const gridElements = findTemplateNodes(
        template,
        (node): node is VueTemplateNode<VElement> =>
          node.node.type === 'VElement' && gridElementNamesLookup.has(node.node.name),
      );
      if (gridElements.length === 0) return;
      gridElements.forEach((element) => {
        const startTag = getVueTemplateNodeChild(element, 'startTag');
        const attributes = getVueTemplateNodeChild(startTag, 'attributes');
        attributes.forEach((attribute) => {
          const { node } = attribute;
          // If this is the overall gridOptions attribute, traverse over the properties of the attribute value
          if (isAgGridVueElementBoundGridOptionsAttribute(node)) {
            const attributeValue = node.value;
            const gridOptionsDataFieldName =
              attributeValue &&
              attributeValue.expression &&
              attributeValue.expression.type === 'Identifier'
                ? attributeValue.expression.name
                : null;
            // FIXME: warn if unable to parse gridOptions attribute value
            if (!gridOptionsDataFieldName) return;
            const gridOptionsDataFieldAccessors = getVueComponentDataFieldReferences(
              path,
              gridOptionsDataFieldName,
            ).flatMap((expression) => {
              if (!expression.isExpression()) return [];
              // FIXME: deduplicate Vue component data field accessors
              return getAccessorExpressionPaths(expression) || [];
            });
            gridOptionsDataFieldAccessors.forEach((accessor) => {
              visitObjectAccessor(accessor, visitor, context);
            });
          } else {
            // Otherwise visit the individual attribute
            visitor.vueAttribute(attribute, path, element, context);
          }
        });
      });
      if (template.template.mutations.length > 0) {
        updateVueComponentTemplate(path, template, context);
      }
    },
  };
}

function visitObjectAccessor<S>(
  accessorPath: AccessorPath,
  propertyVisitor: ObjectPropertyVisitor<S>,
  context: S,
): void {
  const { initializers, assignments, references } = explainAccessorPathUsages(accessorPath);
  const assignedValues = assignments.map((assignment) => assignment.get('right'));
  [...initializers, ...assignedValues].forEach((value) => {
    if (value.isObjectExpression()) {
      value.get('properties').forEach((property) => {
        if (isPropertyInitializerNode(property)) {
          propertyVisitor.init(property, context);
        }
      });
    }
  });
  references.forEach((reference) => {
    // Determine whether the reference is accessing a field on the object
    if (
      reference.accessor.parentPath.isMemberExpression() ||
      reference.accessor.parentPath.isOptionalMemberExpression()
    ) {
      const propertyAccessor = reference.accessor.parentPath;
      const object = propertyAccessor.get('object');
      if (Array.isArray(object) || reference.accessor.node !== object.node) return;
      // Determine whether the reference is setting the object field
      if (isPropertyAssignmentNode(propertyAccessor.parentPath)) {
        // FIXME: add tests for (optionally nested) renamed property assignments
        propertyVisitor.set(propertyAccessor.parentPath, context);
      } else if (isPropertyAccessorNode(propertyAccessor)) {
        propertyVisitor.get(propertyAccessor, context);
      }
    } else if (
      reference.accessor.isObjectProperty() &&
      reference.accessor.parentPath.isObjectExpression()
    ) {
      propertyVisitor.init(reference.accessor, context);
    }
  });
}

export function explainAccessorPathUsages(accessorPath: AccessorPath): {
  initializers: Array<NodePath<AstNode>>;
  assignments: Array<NodePath<AssignmentExpression>>;
  references: Array<AccessorReference>;
} {
  const initializers = accessorPath.path.reduce(
    (roots, { key }) =>
      roots.flatMap((root) => {
        if (root.isObjectExpression()) {
          return retrieveObjectLiteralPropertyAccessor(root, key).map(([key, value]) => value);
        }
        if (root.isArrayExpression()) {
          return retrieveArrayLiteralPropertyAccessor(root, key).map(([key, value]) => value);
        }
        return [];
      }),
    [accessorPath.root.target],
  );
  const [assignments, references] = getAccessorPathReferences(accessorPath).reduce(
    (results, reference) => {
      const [assignments, accessorReferences] = results;
      if (reference.accessor.parentPath.isAssignmentExpression()) {
        const assignment = reference.accessor.parentPath;
        const initializer = assignment.get('right');
        if (reference.accessor.node !== initializer.node) {
          assignments.push(assignment);
        }
      } else {
        accessorReferences.push(reference);
      }
      return results;
    },
    [new Array<NodePath<AssignmentExpression>>(), new Array<AccessorReference>()],
  );
  return { initializers, assignments, references };
}

function retrieveObjectLiteralPropertyAccessor(
  root: NodePath<Types.ObjectExpression>,
  key: AccessorKey,
): Array<
  [{ key: NodePath<ObjectProperty['key']>; computed: boolean }, NodePath<Expression | ObjectMethod>]
> {
  const namedProperties = root
    .get('properties')
    .map((property) => {
      if (property.isObjectProperty() || property.isObjectMethod()) {
        const key = property.isObjectProperty()
          ? property.get('key')
          : property.isObjectMethod()
            ? property.get('key')
            : null;
        const computed = property.node.computed;
        if (!key) return null;
        return { key, computed, property };
      }
      if (property.isSpreadElement()) return null;
      return null;
    })
    .filter(nonNull);
  if (AccessorKey.Property.is(key)) {
    return namedProperties
      .map(
        ({
          key: propertyKey,
          computed,
          property,
        }):
          | [
              { key: NodePath<ObjectProperty['key']>; computed: boolean },
              NodePath<Expression | ObjectMethod>,
            ]
          | null => {
          if (getStaticPropertyKey(propertyKey.node, computed) === key.name) {
            if (property.isObjectMethod()) return [{ key: propertyKey, computed }, property];
            const value = property.get('value');
            if (!value.isExpression()) return null;
            return [{ key: propertyKey, computed }, value];
          }
          return null;
        },
      )
      .filter(nonNull);
  } else if (AccessorKey.PrivateField.is(key)) {
    return namedProperties
      .map(
        ({
          key: propertyKey,
          computed,
          property,
        }):
          | [
              { key: NodePath<ObjectProperty['key']>; computed: boolean },
              NodePath<Expression | ObjectMethod>,
            ]
          | null => {
          if (propertyKey.isPrivateName() && propertyKey.node.id.name === key.name) {
            if (property.isObjectMethod()) return [{ key: propertyKey, computed }, property];
            const value = property.get('value');
            if (!value.isExpression()) return null;
            return [{ key: propertyKey, computed }, value];
          }
          return null;
        },
      )
      .filter(nonNull);
  } else if (AccessorKey.Index.is(key)) {
    const propertyKey = AccessorKey.Property({ name: String(key.index) });
    return retrieveObjectLiteralPropertyAccessor(root, propertyKey);
  } else if (AccessorKey.ObjectRest.is(key)) {
    // FIXME: support traversing object rest keys
    return [];
  } else if (AccessorKey.ArrayRest.is(key)) {
    return [];
  } else if (AccessorKey.Computed.is(key)) {
    const parsedKey = getStaticPropertyKey(key.expression.node, true);
    if (typeof parsedKey !== 'string') return [];
    const propertyKey = AccessorKey.Property({ name: parsedKey });
    return retrieveObjectLiteralPropertyAccessor(root, propertyKey);
  } else {
    unreachable(key);
  }
}

function retrieveArrayLiteralPropertyAccessor(
  root: NodePath<Types.ArrayExpression>,
  key: AccessorKey,
): Array<[number, NodePath<Expression>]> {
  // FIXME: support traversing array literals
  return [];
}

export function isGridApiReference(
  accessor: NodePath<Expression>,
  context: AstTransformContext<AstCliContext & VueComponentCliContext>,
): boolean {
  const references = getGridApiReferences(accessor, context);
  if (!references) return false;
  return references.length > 0;
}

export function getGridApiReferences(
  accessor: NodePath<Expression>,
  context: AstTransformContext<FsContext & VueComponentCliContext>,
): Array<GridApiDefinition> | null {
  // Determine the ultimate referents of the accessor within the current scope,
  // bailing out if the accessor is invalid
  const accessorPaths = getAccessorExpressionPaths(accessor);
  if (!accessorPaths) return null;
  const jsGridApiReferences = getJsGridApiReferences(accessorPaths, context);
  const reactGridApiReferences = getReactGridApiReferences(accessorPaths, context);
  const angularGridApiReferences = getAngularGridApiReferences(accessorPaths, context);
  const vueGridApiReferences = getVueGridApiReferences(accessorPaths, context);
  if (
    !jsGridApiReferences &&
    !reactGridApiReferences &&
    !angularGridApiReferences &&
    !vueGridApiReferences
  )
    return null;
  return [
    ...(jsGridApiReferences || []),
    ...(reactGridApiReferences || []),
    ...(angularGridApiReferences || []),
    ...(vueGridApiReferences || []),
  ];
}

export function isColumnApiReference(
  accessor: NodePath<Expression>,
  context: AstTransformContext<AstCliContext & VueComponentCliContext>,
): boolean {
  const references = getColumnApiReferences(accessor, context);
  if (!references) return false;
  return references.length > 0;
}

export function getColumnApiReferences(
  accessor: NodePath<Expression>,
  context: AstTransformContext<AstCliContext & VueComponentCliContext>,
): Array<GridApiDefinition> | null {
  // Determine the ultimate referents of the accessor within the current scope,
  // bailing out if the accessor is invalid
  const accessorPaths = getAccessorExpressionPaths(accessor);
  if (!accessorPaths) return null;
  const reactColumnApiReferences = getReactColumnApiReferences(accessorPaths, context);
  const angularColumnApiReferences = getAngularColumnApiReferences(accessorPaths, context);
  const vueColumnColumnReferences = getVueColumnApiReferences(accessorPaths, context);
  if (!reactColumnApiReferences && !angularColumnApiReferences && !vueColumnColumnReferences) {
    return null;
  }
  return [
    ...(reactColumnApiReferences || []),
    ...(angularColumnApiReferences || []),
    ...(vueColumnColumnReferences || []),
  ];
}

export function getJsGridApiReferences(
  accessorPaths: Array<AccessorPath>,
  context: AstTransformContext<TransformContext>,
): Array<GridApiDefinition> | null {
  // Match only accessor paths that are direct references to a grid initializer expression
  const targets = accessorPaths
    .map(({ root, path }) => {
      // Ignore accessor paths that drill down within the root expression value
      if (path.length > 0) return null;
      // Attempt to parse the expression value as a grid API initializer
      return matchJsGridApiInitializer(root.target, context);
    })
    .filter(nonNull);
  if (targets.length === 0) return null;
  // Deduplicate any aliased grid API initializers
  const deduplicatedTargets = targets.length > 1 ? Array.from(new Set(targets)) : targets;
  return deduplicatedTargets;
}

function matchJsGridApiInitializer(
  path: NodePath<AstNode>,
  context: AstTransformContext<TransformContext>,
): JsGridApiDefinition | null {
  if (!path.isCallExpression() && !path.isOptionalCallExpression()) return null;
  const typedPath = path as NodePath<CallExpression | OptionalCallExpression>;
  const callee = typedPath.get('callee');
  if (!callee.isExpression()) return null;
  const gridApiImport = getNamedModuleImportExpression(
    callee,
    AG_GRID_JS_PACKAGE_NAME_MATCHER,
    AG_GRID_JS_CONSTRUCTOR_EXPORT_NAME,
    context,
  );
  if (!gridApiImport) return null;
  const { element, options } = parseJsGridApiInitializerArguments(typedPath.get('arguments'));
  return GridApiDefinition.Js({ initializer: path, element, options });
}

function parseJsGridApiInitializerArguments(
  args: Array<
    NodePath<CallExpression['arguments'][number] | OptionalCallExpression['arguments'][number]>
  >,
): {
  element: NodePath<Expression> | null;
  options: NodePath<Expression> | null;
} {
  const { parsedArgs } = args.reduce(
    (result, argument) => {
      if (result.done) return result;
      if (argument.isSpreadElement()) {
        result.done = true;
        return result;
      }
      result.parsedArgs.push(argument.isExpression() ? argument : null);
      return result;
    },
    { parsedArgs: new Array<NodePath<Expression> | null>(), done: false },
  );
  const [element = null, options = null] = parsedArgs;
  return { element, options };
}

export function getReactGridApiReferences(
  accessorPaths: Array<AccessorPath>,
  context: AstTransformContext<TransformContext>,
): Array<ReactGridApiDefinition> | null {
  return getReactPublicApiReferences(AG_GRID_REACT_API_ACCESSOR_NAME, accessorPaths, context);
}

export function getReactColumnApiReferences(
  accessorPaths: Array<AccessorPath>,
  context: AstTransformContext<TransformContext>,
): Array<ReactGridApiDefinition> | null {
  return getReactPublicApiReferences(
    AG_GRID_REACT_COLUMN_API_ACCESSOR_NAME,
    accessorPaths,
    context,
  );
}

function getReactPublicApiReferences(
  apiName: string,
  accessorPaths: Array<AccessorPath>,
  context: AstTransformContext<TransformContext>,
): Array<ReactGridApiDefinition> | null {
  // Get a list of JSX grid elements referred to via the accessor
  const results = accessorPaths
    .map((accessor) => {
      // Match only accessor paths that end with `.current.api`, trimming the suffix
      const propertyAccessorSuffix = [
        AccessorKey.Property({ name: REACT_REF_VALUE_ACCESSOR_NAME }),
        AccessorKey.Property({ name: apiName }),
      ];
      const target = removeAccessorPathSuffix(accessor, propertyAccessorSuffix);
      if (!target) return null;
      // Look up references to the target object,
      // matching only bindings that are used as the `ref` prop of a JSX grid element
      const references = getAccessorPathReferences(target);
      if (references.length === 0) return null;
      const elements = references
        .filter(AccessorReference.Local.is)
        .map((reference) => {
          const { binding } = reference;
          const element = getReactBoundElementRef(binding);
          if (!element || !isAgGridJsxElement(element, context)) return null;
          return element;
        })
        .filter(nonNull);
      if (elements.length === 0) return null;
      const uniqueElements = Array.from(new Set(elements));
      return uniqueElements.map((element) =>
        GridApiDefinition.React({ element, refAccessor: accessor }),
      );
    })
    .filter(nonNull)
    .flatMap((results) => results);
  return results.length === 0 ? null : results;
}

function isAgGridJsxElement(
  element: NodePath<JSXElement>,
  context: AstTransformContext<TransformContext>,
): boolean {
  const elementName = element.get('openingElement').get('name');
  // FIXME: consider supporting namespaced JSX element names
  if (!elementName.isJSXIdentifier()) return false;

  const importDeclaration = getNamedModuleImportExpression(
    elementName,
    AG_GRID_REACT_PACKAGE_NAME_MATCHER,
    AG_GRID_REACT_GRID_COMPONENT_NAME,
    context,
  );
  if (!importDeclaration) return false;
  return true;
}

function isAgGridJsxElementGridOptionsProp(
  path: NodePath<JSXAttribute | JSXSpreadAttribute>,
): boolean {
  if (path.isJSXSpreadAttribute()) return true;
  if (path.isJSXAttribute()) {
    const propName = path.get('name');
    return (
      propName.isJSXIdentifier() && propName.node.name === AG_GRID_REACT_GRID_OPTIONS_PROP_NAME
    );
  }
  return false;
}

export function getAngularGridApiReferences(
  accessorPaths: Array<AccessorPath>,
  context: AstTransformContext<FsContext>,
): Array<AngularGridApiDefinition> | null {
  return getAngularPublicApiReferences(AG_GRID_ANGULAR_API_ACCESSOR_NAME, accessorPaths, context);
}

export function getAngularColumnApiReferences(
  accessorPaths: Array<AccessorPath>,
  context: AstTransformContext<FsContext>,
): Array<AngularGridApiDefinition> | null {
  return getAngularPublicApiReferences(
    AG_GRID_ANGULAR_COLUMN_API_ACCESSOR_NAME,
    accessorPaths,
    context,
  );
}

function getAngularPublicApiReferences(
  accessorName: string,
  accessorPaths: Array<AccessorPath>,
  context: AstTransformContext<FsContext>,
): Array<AngularGridApiDefinition> | null {
  /*
    Angular grid API instances can be obtained via two separate methods:

      1. Accessing the `.api` property of an `<ag-grid-angular>` template element located via a `@ViewChild` decorator
      2. Grabbing the `.api` property from the event parameter within one of the event handlers assigned to a grid

    This means that to determine whether a given accessor path refers to a grid API instance, we need to build a list of
    grid API instances declared within the accessor path's enclosing Angular component scope, then determine whether the
    accessor path refers to one of those grid API instances by either of the two methods.
  */
  // Build a list of potential grid API event object accessors and their corresponding class methods
  // (bear in mind we don't yet have enough information to determine whether the methods are semantically valid or not,
  // or even whether the containing classes refer to Angular components)
  const potentialGridEventOrElementReferences = accessorPaths
    .map((accessor) => {
      // Match only accessor paths that end with `.api`, getting a path with the suffix trimmed
      const propertyAccessorSuffix = [AccessorKey.Property({ name: accessorName })];
      const target = removeAccessorPathSuffix(accessor, propertyAccessorSuffix);
      if (!target) return null;
      // Look up references to the target object, matching only bindings that are potential references to either a
      // named grid element within the template, or a grid event object passed to a grid event handler
      const potentialEventOrElementReferences = getAccessorPathReferences(target);
      if (potentialEventOrElementReferences.length === 0) return null;
      return { target, references: potentialEventOrElementReferences, accessor };
    })
    .filter(nonNull);
  if (potentialGridEventOrElementReferences.length === 0) return null;
  // Get a list of named internal template elements that either we know are definitely grid elements (due to having a
  // grid element type in the `ViewChild` declaration), or that could potentially be grid elements depending on whether
  // the named element refers an `<ag-grid-angular>` element
  const potentialNamedGridElements = potentialGridEventOrElementReferences
    .map(({ references, accessor }) =>
      references
        .map(
          (
            reference,
          ): {
            component: NodePath<Class>;
            elementId: string | null;
            accessor: AccessorPath;
          } | null => {
            if (!AccessorReference.Property.is(reference)) return null;
            const { target: component, accessor: property } = reference;
            if (!component.isClass() || !property.isClassProperty()) return null;
            const namedViewChild = getAngularViewChildMetadata(property, context);
            if (!namedViewChild) return null;
            if (isAgGridAngularComponentImportReference(namedViewChild, context)) {
              return { component, elementId: null, accessor };
            }
            if (namedViewChild.isStringLiteral()) {
              return { component, elementId: namedViewChild.node.value, accessor };
            }
            return null;
          },
        )
        .filter(nonNull),
    )
    .flatMap((results) => results);
  // Given that grid events are always provided as parameters to a handler method, look up the event handlers
  const potentialGridEventHandlerMethods = potentialGridEventOrElementReferences
    .map(({ references, accessor }) =>
      references
        .map((reference) => {
          // FIXME: Handle destructured event handler parameters
          if (!AccessorReference.Local.is(reference)) return null;
          const { binding } = reference;
          // Determine whether this variable usage is a class method parameter, bailing out if not
          if (binding.kind !== 'param') return null;
          if (!binding.path.isIdentifier()) return null;
          if (!binding.path.parentPath.isClassMethod()) return null;
          const method = binding.path.parentPath;
          if (!method.parentPath.isClassBody() || !method.parentPath.parentPath.isClass()) {
            return null;
          }
          const methodName = parseMemberFieldName(method.get('key'), method.node.computed);
          if (!methodName) return null;
          // Now that we know the variable is being used as a class method parameter,
          // store the method as a potential grid event handler candidate
          const component = method.parentPath.parentPath;
          return { component, method, methodName, accessor };
        })
        .filter(nonNull),
    )
    .filter(nonNull)
    .flatMap((results) => results);
  // Bail out if there are no potential element or event handler candidates
  if (potentialNamedGridElements.length === 0 && potentialGridEventHandlerMethods.length === 0) {
    return null;
  }
  // Deduplicate the components to save on unnecessary template parsing for multiply-referenced components
  const deduplicatedComponents = new Set([
    ...potentialNamedGridElements.map(({ component }) => component),
    ...potentialGridEventHandlerMethods.map(({ component }) => component),
  ]);
  // Parse the component templates for any valid Angular components
  const componentTemplates = new Map(
    Array.from(deduplicatedComponents)
      .map((component): [NodePath<Class>, AngularTemplateNode<TmplAST>] | null => {
        const templateDefinition = parseAngularComponentTemplate(component, context);
        if (!templateDefinition) return null;
        const { template } = templateDefinition;
        return [component, template];
      })
      .filter(nonNull),
  );
  // Determine the set of components that contain valid grid elements
  const componentGridElements = new Map(
    Array.from(componentTemplates)
      .map(
        ([component, template]):
          | [
              NodePath<Class>,
              {
                template: AngularTemplateNode<TmplAST>;
                gridElements: Array<AngularTemplateNode<Angular.TmplAstElement>>;
              },
            ]
          | null => {
          const gridElements = findNamedAngularTemplateElements(
            template,
            AG_GRID_ANGULAR_ELEMENT_NAME,
          );
          if (gridElements.length === 0) return null;
          return [component, { template, gridElements }];
        },
      )
      .filter(nonNull),
  );
  // Bail out if none of the components contain grid elements
  if (componentGridElements.size === 0) return null;
  // Now that we know which components contain grid elements, we can return the subset of potential elements and handler
  // methods that are actually bound to a valid grid element event output
  const gridElementReferences = potentialNamedGridElements
    .map(({ component, elementId, accessor }) => {
      // Ignore any methods whose containing class is not a valid Angular component that contains grid elements
      const gridElements = componentGridElements.get(component);
      if (!gridElements) return null;
      // Iterate over the component's grid elements to determine if any are matching named elements
      const { template, gridElements: elements } = gridElements;
      const matchedElements = elementId
        ? elements.filter((element) =>
            getAngularTemplateNodeChild(element, 'references').some(
              (ref) => ref.node.name === elementId,
            ),
          )
        : elements;
      if (matchedElements.length === 0) return null;
      return matchedElements.map((element) =>
        GridApiDefinition.Angular({
          component,
          template,
          element,
          binding: AngularGridApiBinding.Element({ accessor }),
        }),
      );
    })
    .filter(nonNull)
    .flatMap((results) => results);
  const gridHandlerReferences = potentialGridEventHandlerMethods
    .map(({ component, method, methodName, accessor }) => {
      // Ignore any methods whose containing class is not a valid Angular component that contains grid elements
      const gridElements = componentGridElements.get(component);
      if (!gridElements) return null;
      // Iterate over the component's grid elements to determine if any have event outlets bound to this method
      const { template, gridElements: elements } = gridElements;
      const boundEvents = elements.flatMap((element) =>
        getAngularTemplateNodeChild(element, 'outputs')
          .map((output) => {
            // Ignore any outputs that are not known grid event outputs
            if (!AG_GRID_ANGULAR_EVENT_HANDLERS.has(output.node.name)) return null;
            // Ignore any outputs that do not invoke the current handler method
            if (!isNamedAngularComponentMethodCallExpression(methodName, output.node.handler))
              return null;
            // At this point, we know that the current method is invoked by a grid element event handler
            return GridApiDefinition.Angular({
              component,
              template,
              element,
              binding: AngularGridApiBinding.Event({
                output,
                handler: method,
                eventAccessor: accessor,
              }),
            });
          })
          .filter(nonNull),
      );
      return boundEvents.length === 0 ? null : boundEvents;
    })
    .filter(nonNull)
    .flatMap((results) => results);
  const gridReferences = [...gridElementReferences, ...gridHandlerReferences];
  return gridReferences.length === 0 ? null : gridReferences;
}

function isAgGridAngularComponentImportReference(
  reference: NodePath<Expression>,
  context: AstTransformContext<TransformContext>,
): boolean {
  const importDeclaration = getNamedModuleImportExpression(
    reference,
    AG_GRID_ANGULAR_PACKAGE_NAME_MATCHER,
    AG_GRID_ANGULAR_GRID_COMPONENT_NAME,
    context,
  );
  if (!importDeclaration) return false;
  return true;
}

function isAgGridAngularElementBoundGridOptionsInput(
  attribute: AngularTemplateNode<Angular.TmplAstBoundAttribute>,
): boolean {
  return isNamedAngularElementBoundAttribute(
    attribute,
    AG_GRID_ANGULAR_GRID_OPTIONS_ATTRIBUTE_NAME,
  );
}

function isNamedAngularElementBoundAttribute(
  attribute: AngularTemplateNode<Angular.TmplAstBoundAttribute | Angular.TmplAstBoundEvent>,
  key: string,
): boolean {
  return attribute.node.name === key;
}

export function getVueGridApiReferences(
  accessorPaths: Array<AccessorPath>,
  context: AstTransformContext<VueComponentCliContext>,
): Array<VueGridApiDefinition> | null {
  return getVuePublicApiReferences(AG_GRID_VUE_API_ACCESSOR_NAME, accessorPaths, context);
}

export function getVueColumnApiReferences(
  accessorPaths: Array<AccessorPath>,
  context: AstTransformContext<VueComponentCliContext>,
): Array<VueGridApiDefinition> | null {
  return getVuePublicApiReferences(AG_GRID_VUE_COLUMN_API_ACCESSOR_NAME, accessorPaths, context);
}

function getVuePublicApiReferences(
  apiName: string,
  accessorPaths: Array<AccessorPath>,
  context: AstTransformContext<VueComponentCliContext>,
): Array<VueGridApiDefinition> | null {
  // Get a list of potential grid API event object accessors and their corresponding class methods
  // (bear in mind we don't yet have enough information to determine whether the methods are event handlers or not,
  // or even whether the containing classes refer to Vue components)
  const potentialHandlerMethods = accessorPaths
    .map((accessor) => {
      // Match only accessor paths that end with `.api`, getting a path with the suffix trimmed
      const propertyAccessorSuffix = [AccessorKey.Property({ name: apiName })];
      const target = removeAccessorPathSuffix(accessor, propertyAccessorSuffix);
      if (!target) return null;
      // Look up references to the target object,
      // matching only bindings that are potential references a grid API event object
      const potentialEventReferences = getAccessorPathReferences(target);
      if (potentialEventReferences.length === 0) return null;
      const potentialHandlerMethods = potentialEventReferences
        .map((reference) => {
          // FIXME: Handle destructured event handler parameters
          if (!AccessorReference.Local.is(reference)) return null;
          const { binding } = reference;
          if (binding.kind !== 'param') return null;
          if (!binding.path.isIdentifier()) return null;
          const componentMethod = matchVueComponentMethod(binding.path.parentPath);
          if (!componentMethod) return null;
          const { component, methodName, method } = componentMethod;
          return { component, method, methodName, accessor };
        })
        .filter(nonNull);
      return potentialHandlerMethods;
    })
    .filter(nonNull)
    .flatMap((results) => results);
  // Bail out if there are no potential event handler candidates
  if (potentialHandlerMethods.length === 0) return null;
  // Deduplicate the components to save on unnecessary template parsing for multiply-referenced components
  const deduplicatedComponents = new Set(potentialHandlerMethods.map(({ component }) => component));
  // Parse the component templates for any valid grid elements
  const componentGridElements = new Map(
    Array.from(deduplicatedComponents)
      .map(
        (
          component,
        ):
          | [
              NodePath<ObjectExpression>,
              { template: VElement; gridElements: Array<VueTemplateNode<VElement>> },
            ]
          | null => {
          const templateComponentDeclarations = getVueComponentComponentDeclarations(component);
          if (!templateComponentDeclarations || templateComponentDeclarations.size === 0) {
            return null;
          }
          const gridComponentElementNames = Array.from(templateComponentDeclarations)
            .filter(([, value]) => isAgGridVueComponentImportReference(value, context))
            .map(([elementName]) => elementName);
          if (gridComponentElementNames.length === 0) return null;
          const template = getVueComponentTemplate(component, context);
          if (!template) return null;
          const gridElementNames = new Set(gridComponentElementNames);
          const gridElements = findTemplateNodes(
            template,
            (node): node is VueTemplateNode<VElement> =>
              node.node.type === 'VElement' && gridElementNames.has(node.node.name),
          );
          if (gridElements.length === 0) return null;
          return [component, { template: template.node, gridElements }];
        },
      )
      .filter(nonNull),
  );
  // Bail out if none of the components contain grid elements
  if (componentGridElements.size === 0) return null;
  // Now that we know which components contain grid elements, we can return the subset of potential handler methods
  // that are bound to a valid grid element event directive
  const gridReferences = potentialHandlerMethods
    .map(({ component, method, methodName, accessor }) => {
      // Ignore any methods whose containing class is not a valid Vue component that contains grid elements
      const gridElements = componentGridElements.get(component);
      if (!gridElements) return null;
      // Iterate over the component's grid elements to determine if any have event outlets bound to this method
      const { template, gridElements: elements } = gridElements;
      const boundEvents = elements.flatMap((element) =>
        getVueElementEventHandlerDirectives(element)
          .map((directive) => {
            // Ignore any directives that are not known grid event handlers
            const eventName = getVueElementEventHandlerDirectiveName(directive.node);
            if (!eventName || !AG_GRID_VUE_EVENT_HANDLERS.has(eventName)) return null;
            const value = getVueTemplateNodeChild(directive, 'value');
            const expression = value && getVueTemplateNodeChild(value, 'expression');
            if (!expression) return null;
            // Ignore any outputs that do not invoke the current method
            const isCurrentMethodHandler =
              expression.node.type === 'Identifier' && expression.node.name === methodName;
            if (!isCurrentMethodHandler) return null;
            // At this point, we know that the current method is invoked by a grid element event handler
            return GridApiDefinition.Vue({
              component,
              template,
              element,
              directive,
              handler: method,
              eventAccessor: accessor,
            });
          })
          .filter(nonNull),
      );
      return boundEvents.length === 0 ? null : boundEvents;
    })
    .filter(nonNull)
    .flatMap((results) => results);
  return gridReferences.length === 0 ? null : gridReferences;
}

function getVueComponentTemplate(
  component: NodePath<Types.ObjectExpression>,
  context: AstTransformContext<VueComponentCliContext>,
): VueTemplateNode<VElement> | null {
  // If the current context is a Vue SFC component transform,
  // return the template that has already been parsed by the plugin
  if (context.opts.vue && context.opts.vue.template) {
    return context.opts.vue.template;
  }
  // Otherwise attempt to locate a template string literal defined on the component definition properties
  const templateSource = getVueComponentTemplateSource(component);
  if (!templateSource) return null;
  return parseVueComponentTemplateSource(templateSource);
}

function updateVueComponentTemplate(
  component: NodePath<Types.ObjectExpression>,
  template: VueTemplateNode<VElement>,
  context: AstTransformContext<AstCliContext & VueComponentCliContext>,
): void {
  // If the current context is a Vue SFC component transform,
  // update the template that has already been parsed by the plugin
  if (context.opts && context.opts.vue && context.opts.vue.template) {
    context.opts.vue.template = template;
    return;
  }
  // Otherwise attempt to locate a template property defined on the component definition properties
  const templateProperty = getVueComponentTemplateProperty(component);
  if (!templateProperty) return;
  const templateSource = printTemplate(template, new VueTemplateFormatter());
  if (!templateSource) return;
  const value = templateProperty.get('value');
  if (value.isStringLiteral() && !templateSource.includes('\n')) {
    value.replaceWith(t.stringLiteral(templateSource));
  } else {
    value.replaceWith(t.templateLiteral([t.templateElement({ raw: templateSource })], []));
  }
}

function matchAgGridVueComponentElementNames(
  component: NodePath<ObjectExpression>,
  context: AstTransformContext<TransformContext>,
): Array<string> | null {
  const componentDeclarations = getVueComponentComponentDeclarations(component);
  if (!componentDeclarations) return null;
  const agGridElementNames = Array.from(componentDeclarations.entries())
    .filter(([, reference]) => isAgGridVueComponentImportReference(reference, context))
    .map(([elementName]) => elementName);
  return agGridElementNames;
}

interface VBindDirective<T extends string> extends VDirective {
  key: VBindDirectiveKey<T>;
}

interface VBindDirectiveKey<T extends string> extends VDirectiveKey {
  argument: VNamedIdentifier<T>;
}

interface VNamedIdentifier<T extends string> extends VIdentifier {
  name: T;
}

function isAgGridVueElementBoundGridOptionsAttribute(
  attribute: VDirective | VAttribute,
): attribute is VBindDirective<typeof AG_GRID_VUE_GRID_OPTIONS_ATTRIBUTE_NAME> {
  return isNamedVueElementBoundAttribute(attribute, AG_GRID_VUE_GRID_OPTIONS_ATTRIBUTE_NAME);
}

function isNamedVueElementBoundAttribute<T extends string>(
  attribute: VDirective | VAttribute,
  key: T,
): attribute is VBindDirective<T> {
  return (
    isVueElementBoundAttribute(attribute) &&
    // FIXME: Clarify Vue element attribute rawName vs name distinction
    attribute.key.argument.rawName === key
  );
}

function isVueElementBoundAttribute(
  attribute: VDirective | VAttribute,
): attribute is VBindDirective<string> {
  if (!attribute.directive || attribute.key.name.name !== 'bind') return false;
  if (!attribute.key.argument || attribute.key.argument.type !== 'VIdentifier') return false;
  return true;
}

function isAgGridVueComponentImportReference(
  reference: NodePath<Expression>,
  context: AstTransformContext<TransformContext>,
): boolean {
  const importDeclaration = getNamedModuleImportExpression(
    reference,
    AG_GRID_VUE_PACKAGE_NAME_MATCHER,
    AG_GRID_VUE_GRID_COMPONENT_NAME,
    context,
  );
  if (!importDeclaration) return false;
  return true;
}

function getJsxAttributeName(
  attribute: NodePath<JSXAttribute | JSXSpreadAttribute>,
): NodePath<JSXIdentifier> | null {
  if (attribute.isJSXSpreadAttribute()) {
    return null;
  } else if (attribute.isJSXAttribute()) {
    const value = attribute.get('name');
    if (value.isJSXIdentifier()) return value;
    return null;
  }
  return null;
}

function getJsxAttributeValue(
  attribute: NodePath<JSXAttribute | JSXSpreadAttribute>,
): NodePath<Expression> | null {
  if (attribute.isJSXSpreadAttribute()) {
    return attribute.get('argument');
  } else if (attribute.isJSXAttribute()) {
    const value = getOptionalNodeFieldValue(attribute.get('value'));
    if (!value) return null;
    if (value.isJSXExpressionContainer()) return getJsxExpressionContainerValue(value);
    if (value.isJSXElement() || value.isJSXFragment() || value.isStringLiteral()) return value;
    return null;
  }
  return null;
}

function getJsxExpressionContainerValue(
  value: NodePath<JSXExpressionContainer>,
): NodePath<Expression> | null {
  const expression = value.get('expression');
  if (expression.isJSXEmptyExpression()) return null;
  if (expression.isExpression()) return expression;
  return null;
}

function parseMemberFieldName(
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): string | null {
  if (key.isIdentifier() && !computed) return key.node.name;
  if (key.isStringLiteral()) return key.node.value;
  return null;
}

function removeAccessorPathSuffix(
  accessorPath: AccessorPath,
  suffix: Array<AccessorKey>,
): AccessorPath | null {
  const { root, path } = accessorPath;
  if (path.length < suffix.length) return null;
  const numStaticSegments = suffix.length;
  if (
    !areAccessorPathsEqual(
      path.slice(path.length - numStaticSegments).map(({ key }) => key),
      suffix,
    )
  ) {
    return null;
  }
  return { root, path: path.slice(0, path.length - numStaticSegments) };
}

function getAccessorPathReferences(accessor: AccessorPath): Array<AccessorReference> {
  if (accessor.path.length === 0) return accessor.root.references;
  return accessor.path[accessor.path.length - 1].references;
}

function areAccessorPathsEqual(left: Array<AccessorKey>, right: Array<AccessorKey>): boolean {
  if (left.length !== right.length) return false;
  return left.every((leftKey, index) => {
    const rightKey = right[index];
    return areAccessorKeysEqual(leftKey, rightKey);
  });
}
