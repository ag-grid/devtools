import {
  getFunctionReturnValues,
  getNamedObjectLiteralStaticPropertyValue,
  getObjectLiteralStaticPropertyValues,
  parseStringExpressionValue,
  findClassMemberAccessors,
  getNamedObjectLiteralStaticProperty,
  type AstNode,
  type NodePath,
  type Types,
  getStaticPropertyKey,
} from '@ag-grid-devtools/ast';
import { nonNull } from '@ag-grid-devtools/utils';
import { parse } from 'vue-eslint-parser';
import { AST } from 'vue-eslint-parser';
import {
  getTemplateNodeChild,
  type TemplateEngine,
  type TemplateFormatter,
  type TemplateMutation,
  type TemplateNode,
  type TemplateNodeMatcher,
  type TemplatePath,
  type TemplateRange,
  type TemplateVisitor,
} from './templateHelpers';

export type { AST } from 'vue-eslint-parser';

type ArrowFunctionExpression = Types.ArrowFunctionExpression;
type Expression = Types.Expression;
type MemberExpression = Types.MemberExpression;
type ObjectExpression = Types.ObjectExpression;
type ObjectMethod = Types.ObjectMethod;
type ObjectProperty = Types.ObjectProperty;
type PrivateName = Types.PrivateName;
type Property = Types.Property;

type HasLocation = AST.HasLocation;
type HasParent = AST.HasParent;
type Node = AST.Node;
type VAttribute = AST.VAttribute;
type VDirective = AST.VDirective;
type VElement = AST.VElement;
type VText = AST.VText;
type VExpressionContainer = AST.VExpressionContainer;

type ComponentInstanceMethod = Exclude<Types.Function, ArrowFunctionExpression>;

function isVueComponentInstanceMethod(
  node: NodePath<AstNode>,
): node is NodePath<ComponentInstanceMethod> {
  return node.isFunction() && !node.isArrowFunctionExpression();
}

const KEYS = AST.KEYS;
const getFallbackKeys = AST.getFallbackKeys;

const VUE_COMPONENT_DEFINITION_COMPONENTS_FIELD_NAME = 'components';
const VUE_COMPONENT_DEFINITION_TEMPLATE_FIELD_NAME = 'template';
const VUE_COMPONENT_DEFINITION_LIFECYCLE_METHODS = new Set([
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeUnmount',
  'unmounted',
  'errorCaptured',
  'renderTracked',
  'renderTriggered',
  'activated',
  'deactivated',
  'serverPrefetch',
]);
const VUE_COMPONENT_INSTANCE_DATA_FIELD_NAME = '$data';

export function getVueComponentTemplateProperty(
  component: NodePath<ObjectExpression>,
): NodePath<ObjectProperty> | null {
  // Get the 'template' property of the component definition object
  const templateProperty = getNamedObjectLiteralStaticProperty(
    component,
    VUE_COMPONENT_DEFINITION_TEMPLATE_FIELD_NAME,
  );
  if (!templateProperty || !templateProperty.isObjectProperty()) return null;
  return templateProperty;
}

export function getVueComponentTemplateSource(
  component: NodePath<ObjectExpression>,
): string | null {
  // Get the 'template' property of the component definition object
  const templateProperty = getVueComponentTemplateProperty(component);
  if (!templateProperty) return null;
  const templateValue = templateProperty.get('value');
  if (!templateValue.isExpression()) return null;
  // Parse template string literal value
  return parseStringExpressionValue(templateValue);
}

export function getVueComponentComponentDeclarations(
  component: NodePath<ObjectExpression>,
): Map<string, NodePath<Expression>> | null {
  // Get the 'components' property of the component definition object
  const componentsProperty = getNamedObjectLiteralStaticPropertyValue(
    component,
    VUE_COMPONENT_DEFINITION_COMPONENTS_FIELD_NAME,
  );
  if (!componentsProperty || !componentsProperty.isObjectExpression()) return null;
  // Parse components object field values
  return new Map(
    Array.from(getObjectLiteralStaticPropertyValues(componentsProperty)).filter(
      (entry): entry is [(typeof entry)[0], NodePath<Expression>] => {
        const [, value] = entry;
        return value.isExpression();
      },
    ),
  );
}

export function getVueComponentDataFieldReferences(
  component: NodePath<ObjectExpression>,
  fieldName: string,
): Array<NodePath<Expression | ObjectMethod>> {
  // Parse the component definition object for references to the named data field within the various Vue component methods
  const options = getObjectLiteralStaticPropertyValues(component);
  const dataInitializers = getVueComponentDataFieldInitializers(options, fieldName);
  const stateMethods = getVueComponentStateOptionsInstanceMethods(options);
  const renderingMethods = getVueComponentRenderingOptionsInstanceMethods(options);
  const lifecycleMethods = getVueComponentLifecycleOptionsInstanceMethods(options);
  const compositionReferences = getVueComponentCompositionOptionsDataFieldReferences(
    options,
    fieldName,
  );
  return [
    ...(dataInitializers || []),
    ...[...stateMethods, ...renderingMethods, ...lifecycleMethods]
      .map((method) => getVueComponentMethodDataFieldReferences(method, fieldName))
      .filter(nonNull)
      .flatMap((references) => references),
    ...(compositionReferences || []),
  ];
}

function getVueComponentDataFieldInitializers(
  options: Map<string, NodePath<Expression | ObjectMethod>>,
  fieldName: string,
): Array<NodePath<Expression | ObjectMethod>> | null {
  const property = options.get('data');
  if (!property) return null;
  if (property.isObjectExpression()) {
    const initializer = getVueComponentObjectLiteralDataFieldInitializer(property, fieldName);
    return initializer ? [initializer] : null;
  }
  if (property.isFunction()) {
    return getFunctionReturnValues(property)
      .map((value) => {
        if (!value.isObjectExpression()) return null;
        return getVueComponentObjectLiteralDataFieldInitializer(value, fieldName);
      })
      .filter(nonNull)
      .flatMap((references) => references || null);
  }
  return null;
}

function getVueComponentObjectLiteralDataFieldInitializer(
  expression: NodePath<ObjectExpression>,
  fieldName: string,
): NodePath<Expression | ObjectMethod> | null {
  return getNamedObjectLiteralStaticPropertyValue(expression, fieldName);
}

function getVueComponentStateOptionsInstanceMethods(
  options: Map<string, NodePath<Expression | ObjectMethod>>,
): Array<NodePath<ComponentInstanceMethod>> {
  /* https://vuejs.org/api/options-state.html */
  const dataReferences = getVueComponentDataOptionInstanceMethods(options);
  const computedReferences = getVueComponentComputedPropertyInstanceMethods(options);
  const methodsReferences = getVueComponentMethodsPropertyInstanceMethods(options);
  return [
    ...(dataReferences || []),
    ...(computedReferences || []),
    ...(methodsReferences || []),
  ].flatMap((references) => references || []);
}

function getVueComponentDataOptionInstanceMethods(
  options: Map<string, NodePath<Expression | ObjectMethod>>,
): Array<NodePath<ComponentInstanceMethod>> | null {
  /* https://vuejs.org/api/options-state.html#data */
  const property = options.get('data');
  if (!property) return null;
  if (isVueComponentInstanceMethod(property)) return [property];
  return null;
}

function getVueComponentComputedPropertyInstanceMethods(
  options: Map<string, NodePath<Expression | ObjectMethod>>,
): Array<NodePath<ComponentInstanceMethod>> | null {
  /* https://vuejs.org/api/options-state.html#computed */
  const property = options.get('computed');
  if (!property || !property.isObjectExpression()) return null;
  const nestedProperties = getObjectLiteralStaticPropertyValues(property);
  return Array.from(nestedProperties.values())
    .flatMap((initializer) => {
      const [getter, setter] = initializer.isObjectExpression()
        ? [
            getNamedObjectLiteralStaticPropertyValue(initializer, 'get'),
            getNamedObjectLiteralStaticPropertyValue(initializer, 'set'),
          ]
        : [initializer, null];
      return [getter, setter]
        .map((accessor) => {
          if (accessor && isVueComponentInstanceMethod(accessor)) return accessor;
          return null;
        })
        .filter(nonNull);
    })
    .filter(nonNull);
}

function getVueComponentMethodsPropertyInstanceMethods(
  options: Map<string, NodePath<Expression | ObjectMethod>>,
): Array<NodePath<ComponentInstanceMethod>> | null {
  /* https://vuejs.org/api/options-state.html#methods */
  const property = options.get('methods');
  if (!property || !property.isObjectExpression()) return null;
  const nestedProperties = getObjectLiteralStaticPropertyValues(property);
  return Array.from(nestedProperties.values())
    .map((value) => (isVueComponentInstanceMethod(value) ? value : null))
    .filter(nonNull);
}

function getVueComponentRenderingOptionsInstanceMethods(
  options: Map<string, NodePath<Expression | ObjectMethod>>,
): Array<NodePath<ComponentInstanceMethod>> {
  /* https://vuejs.org/api/options-rendering.html */
  const renderMethod = getVueComponentRenderOptionInstanceMethod(options);
  return [...(renderMethod ? [renderMethod] : [])];
}

function getVueComponentRenderOptionInstanceMethod(
  properties: Map<string, NodePath<Expression | ObjectMethod>>,
): NodePath<ComponentInstanceMethod> | null {
  /* https://vuejs.org/api/options-rendering.html#render */
  const renderProperty = properties.get('render');
  if (!renderProperty || !isVueComponentInstanceMethod(renderProperty)) return null;
  return renderProperty;
}

function getVueComponentLifecycleOptionsInstanceMethods(
  options: Map<string, NodePath<Expression | ObjectMethod>>,
): Array<NodePath<ComponentInstanceMethod>> {
  /* https://vuejs.org/api/options-lifecycle.html */
  return Array.from(options.entries())
    .filter(([key]) => VUE_COMPONENT_DEFINITION_LIFECYCLE_METHODS.has(key))
    .map(([, value]) => (isVueComponentInstanceMethod(value) ? value : null))
    .filter(nonNull);
}

function getVueComponentCompositionOptionsDataFieldReferences(
  options: Map<string, NodePath<Expression | ObjectMethod>>,
  fieldName: string,
): Array<NodePath<Expression | ObjectMethod>> {
  /* https://vuejs.org/api/options-composition.html */
  const mixinsReferences = getVueComponentMixinsPropertyDataFieldReferences(options, fieldName);
  const extendsReferences = getVueComponentExtendsPropertyDataFieldReferences(options, fieldName);
  return [...(mixinsReferences || []), ...(extendsReferences || [])];
}

function getVueComponentMixinsPropertyDataFieldReferences(
  options: Map<string, NodePath<Expression | ObjectMethod>>,
  fieldName: string,
): Array<NodePath<Expression | ObjectMethod>> | null {
  /* https://vuejs.org/api/options-composition.html#mixins */
  const property = options.get('mixins');
  if (!property || !property.isArrayExpression()) return null;
  return property
    .get('elements')
    .map((mixin) =>
      mixin.isObjectExpression() ? getVueComponentDataFieldReferences(mixin, fieldName) : null,
    )
    .filter(nonNull)
    .flatMap((references) => references);
}

function getVueComponentExtendsPropertyDataFieldReferences(
  options: Map<string, NodePath<Expression | ObjectMethod>>,
  fieldName: string,
): Array<NodePath<Expression | ObjectMethod>> | null {
  /* https://vuejs.org/api/options-composition.html#extends */
  const property = options.get('extends');
  if (!property || !property.isObjectExpression()) return null;
  return getVueComponentDataFieldReferences(property, fieldName);
}

function getVueComponentMethodDataFieldReferences(
  method: NodePath<ComponentInstanceMethod>,
  fieldName: string,
): Array<NodePath<Expression>> | null {
  if (method.isObjectMethod() && method.parentPath.isObjectExpression()) {
    const methodScope = method.parentPath;
    return getVueComponentScopedMethodDataFieldReferences(method, methodScope, fieldName);
  }
  if (method.parentPath.isObjectProperty() && method.parentPath.parentPath.isObjectExpression()) {
    const methodScope = method.parentPath.parentPath;
    return getVueComponentScopedMethodDataFieldReferences(method, methodScope, fieldName);
  }
  return null;
}

function getVueComponentScopedMethodDataFieldReferences(
  method: NodePath<ComponentInstanceMethod>,
  methodScope: NodePath<ObjectExpression>,
  fieldName: string,
): Array<NodePath<Expression>> | null {
  const dataObjectAccessors = new Map<NodePath<MemberExpression>, NodePath<MemberExpression>>();
  return findClassMemberAccessors(
    methodScope,
    method,
    (accessor): accessor is NodePath<MemberExpression> => {
      if (isVueComponentDataObjectAccessor(accessor, fieldName)) {
        dataObjectAccessors.set(accessor, accessor.parentPath);
        return true;
      }
      if (!accessor.isMemberExpression()) return false;
      return isNamedMemberExpression(accessor, fieldName);
    },
  ).map((accessor) => dataObjectAccessors.get(accessor) || accessor);
}

function isNamedMemberExpression(accessor: NodePath<MemberExpression>, key: string): boolean {
  const property = accessor.get('property');
  const computed = accessor.node.computed;
  return getStaticPropertyKey(property.node, computed) === key;
}

function isVueComponentDataObjectAccessor(
  accessor: NodePath<Property | MemberExpression>,
  fieldName: string,
): accessor is NodePath<MemberExpression> & { parentPath: NodePath<MemberExpression> } {
  if (!accessor.isMemberExpression()) return false;
  if (!isNamedMemberExpression(accessor, VUE_COMPONENT_INSTANCE_DATA_FIELD_NAME)) return false;
  if (!accessor.parentPath.isMemberExpression()) return false;
  const parentObject = accessor.parentPath.get('object');
  if (parentObject.node !== accessor.node) return false;
  if (!isNamedMemberExpression(accessor.parentPath, fieldName)) return false;
  return true;
}

export function matchVueComponentMethod(method: NodePath): {
  component: NodePath<ObjectExpression>;
  methodName: string;
  method: NodePath<ObjectMethod>;
} | null {
  // FIXME: support assigning Vue methods as object properties with function values
  if (!method.isObjectMethod()) return null;
  const methodName = parseMemberFieldName(method.get('key'), method.node.computed);
  if (!methodName) return null;
  if (!method.parentPath.isObjectExpression()) {
    return null;
  }
  const methods = method.parentPath;
  if (!methods.parentPath.isObjectProperty()) return null;
  const methodsProperty = methods.parentPath;
  // Bail out in the edge case where the methods object we're currently inspecting is actually the key, not the value
  if (methods.node !== methodsProperty.node.value) return null;
  const component = methodsProperty.parentPath;
  if (!component.isObjectExpression()) return null;
  return { component, methodName, method };
}

export function parseVueSfcComponent(source: string): AST.ESLintProgram {
  return parse(source, {
    sourceType: 'module',
  });
}

export function parseVueComponentTemplateSource(source: string): VueTemplateNode<VElement> {
  const componentSource = `<template>${source}</template>`;
  const component = parseVueSfcComponent(componentSource);
  const template = component.templateBody!;
  return {
    template: {
      engine: new VueTemplateEngine(),
      source: componentSource,
      root: {
        element: template,
        omitRootTag: true,
      },
      mutations: [],
    },
    node: template,
    path: [],
  };
}

type VueNodeMetadataKey = 'type' | keyof HasParent | keyof HasLocation;

export function createVueAstNode<T extends Node['type']>(
  properties: { type: T } & Omit<Extract<Node, { type: T }>, VueNodeMetadataKey>,
): Extract<Node, { type: T }> {
  return {
    parent: null,
    range: [-1, -1],
    loc: {
      start: { line: -1, column: -1 },
      end: { line: -1, column: -1 },
    },
    ...properties,
  } as Extract<Node, { type: T }>;
}

export interface VueTemplateNode<T extends Node> extends TemplateNode<T, VueTemplateRoot, Node> {}

export interface VueTemplateRoot {
  element: VElement;
  omitRootTag: boolean;
}

export type VueTemplateMutation = TemplateMutation<Node>;

export type VueTemplateNodeMatcher<T extends Node> = TemplateNodeMatcher<T, VueTemplateRoot, Node>;

export type VueTemplateVisitor = TemplateVisitor<VueTemplateRoot, Node>;

export class VueTemplateEngine implements TemplateEngine<Node> {
  getNodeChildKeys(node: Node): ReadonlyArray<PropertyKey> | null {
    const keys = KEYS[node.type] || getFallbackKeys(node);
    return keys;
  }
  getNodeChild(parent: Node, childKey: PropertyKey): Node | Array<Node> | null {
    const child = parent[childKey as Exclude<keyof Node, VueNodeMetadataKey>];
    if (!child) return null;
    if (Array.isArray(child)) return child;
    if (isNode(child)) return child;
    return null;
  }
}

export class VueTemplateFormatter implements TemplateFormatter<VueTemplateRoot, Node> {
  getRootNode(root: VueTemplateRoot): Node {
    return root.element;
  }
  getRootPaths(root: VueTemplateRoot, path: TemplatePath): TemplatePath[] {
    return root.omitRootTag && path.length === 0
      ? root.element.children.map((_, index) => ['children', index])
      : [path];
  }
  getNodeRange(node: Node): TemplateRange {
    return { start: node.range[0], end: node.range[1] };
  }
  printNode(node: Node, previous: Node | null, templateSource: string): string {
    return printVueNode(node);
  }
}

export function getVueTemplateNodeChild<
  T extends Node & { [ChildKey in K]: Node | null | Array<Node> },
  K extends keyof T,
>(
  templateNode: VueTemplateNode<T>,
  key: K,
): T[K] extends Node
  ? VueTemplateNode<T[K]>
  : T[K] extends Node | null
  ? VueTemplateNode<Extract<T[K], Node>> | null
  : T[K] extends Array<Node>
  ? Array<VueTemplateNode<T[K][number]>>
  : never {
  return getTemplateNodeChild(templateNode, key) as any;
}

function isNode(x: any): x is Node {
  return x !== null && typeof x === 'object' && typeof x.type === 'string';
}

function printVueNode(node: Node): string {
  switch (node.type) {
    case 'Identifier':
      return node.name;
    case 'VIdentifier':
      return node.rawName;
    // FIXME: format Vue AST node types
    default:
      throw new Error(`Unable to format node type: ${node.type}`);
  }
}

export function isVueDirectiveAttribute(
  templateNode: VueTemplateNode<VAttribute | VDirective>,
): templateNode is VueTemplateNode<VDirective> {
  return templateNode.node.directive;
}

export function getVueElementEventHandlerDirectives(
  element: VueTemplateNode<VElement>,
): Array<VueTemplateNode<VDirective>> {
  return getVueElementDirectives(element).filter((attribute) =>
    isVueEventHandlerDirective(attribute.node),
  );
}

function isVueEventHandlerDirective(node: VDirective): unknown {
  return node.key.name.name === 'on';
}

export function getVueElementDirectives(
  element: VueTemplateNode<VElement>,
): Array<VueTemplateNode<VDirective>> {
  const startTag = getVueTemplateNodeChild(element, 'startTag');
  const attributes = getVueTemplateNodeChild(startTag, 'attributes');
  return attributes.filter(
    (attribute): attribute is VueTemplateNode<VDirective> => attribute.node.directive,
  );
}

export function getVueElementEventHandlerDirectiveName(directive: VDirective): string | null {
  const argument = directive.key.argument;
  if (!argument || argument.type !== 'VIdentifier') return null;
  return argument.name;
}

function parseMemberFieldName(
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): string | null {
  if (key.isIdentifier() && !computed) return key.node.name;
  if (key.isStringLiteral()) return key.node.value;
  return null;
}

export const matchers = {
  element,
  expression,
  text,
};

function element(predicate?: (element: VElement) => boolean): VueTemplateNodeMatcher<VElement> {
  return (node: VueTemplateNode<Node>): node is VueTemplateNode<VElement> => {
    if (node.node.type !== 'VElement') return false;
    if (!predicate) return true;
    return predicate(node.node);
  };
}

function expression(
  predicate?: (expression: VExpressionContainer) => boolean,
): VueTemplateNodeMatcher<VExpressionContainer> {
  return (node: VueTemplateNode<Node>): node is VueTemplateNode<VExpressionContainer> => {
    if (node.node.type !== 'VExpressionContainer') return false;
    if (!predicate) return true;
    return predicate(node.node);
  };
}

function text(predicate?: (text: VText) => boolean): VueTemplateNodeMatcher<VText> {
  return (node: VueTemplateNode<Node>): node is VueTemplateNode<VText> => {
    if (node.node.type !== 'VText') return false;
    if (!predicate) return true;
    return predicate(node.node);
  };
}
