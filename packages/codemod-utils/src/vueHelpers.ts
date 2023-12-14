import {
  findClassMemberAccessors,
  getFunctionReturnValues,
  getNamedObjectLiteralStaticProperty,
  getNamedObjectLiteralStaticPropertyValue,
  getObjectLiteralStaticPropertyValues,
  getStaticPropertyKey,
  parseStringExpressionValue,
  type AstNode,
  type NodePath,
  type Types,
} from '@ag-grid-devtools/ast';
import { nonNull } from '@ag-grid-devtools/utils';
import { parse } from 'vue-eslint-parser';
import { AST } from 'vue-eslint-parser';
import {
  getTemplateNodeChild,
  mergeSourceChunks,
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

type ESLintExpression = AST.ESLintExpression;
type ESLintLiteral = AST.ESLintLiteral;
type ESLintStringLiteral = AST.ESLintStringLiteral;
type ESLintBooleanLiteral = AST.ESLintBooleanLiteral;
type ESLintNullLiteral = AST.ESLintNullLiteral;
type ESLintNumberLiteral = AST.ESLintNumberLiteral;
type ESLintRegExpLiteral = AST.ESLintRegExpLiteral;
type ESLintBigIntLiteral = AST.ESLintBigIntLiteral;
type HasLocation = AST.HasLocation;
type HasParent = AST.HasParent;
type Node = AST.Node;
type Reference = AST.Reference;
type VAttribute = AST.VAttribute;
type VDirective = AST.VDirective;
type VDirectiveKey = AST.VDirectiveKey;
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

function isUnmodifiedVueAstNode(node: Node): boolean {
  return node.range[0] !== -1 && node.range[1] !== -1;
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
    return printVueNode(node, previous, templateSource);
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

export function isTypedVueTemplateNode<T extends Node['type']>(
  nodeType: T,
  templateNode: VueTemplateNode<Node>,
): templateNode is VueTemplateNode<Extract<Node, { type: T }>> {
  const { node } = templateNode;
  return node.type === nodeType;
}

function printVueNode(node: Node, previous: Node | null, templateSource: string): string {
  switch (node.type) {
    case 'Identifier':
      return node.name;
    case 'VIdentifier':
      return node.rawName;
    case 'VAttribute': {
      const result =
        !previous || previous.type !== node.type
          ? // FIXME: allow printing newly-generated Vue attribute nodes
            null
          : !node.directive && !previous.directive
          ? printVueAttributeNode(node, previous, templateSource)
          : node.directive && previous.directive
          ? printVueDirectiveNode(node, previous, templateSource)
          : null;
      if (typeof result === 'string') return result;
      break;
    }
    // FIXME: format Vue AST node types
    default:
      break;
  }
  throw new Error(`Unable to format node type: ${node.type}`);
}

function printVueAttributeNode(
  node: AST.VAttribute,
  previous: AST.VAttribute,
  templateSource: string,
): string | null {
  // Generate the output code based on the existing node
  const existingNode = previous;
  const updatedNode = node;
  const hasKeyUpdate = updatedNode.key.name !== existingNode.key.name;
  const hasValueUpdate =
    updatedNode.value && existingNode.value
      ? updatedNode.value.value !== existingNode.value.value
      : updatedNode.value !== existingNode.value;
  if (!hasKeyUpdate && !hasValueUpdate) {
    return templateSource.slice(existingNode.range[0], existingNode.range[1]);
  }
  return mergeSourceChunks([
    ...(hasKeyUpdate
      ? [
          {
            source: templateSource,
            range: {
              start: existingNode.range[0],
              end: existingNode.key.range[0],
            },
          },
          updatedNode.key.name,
        ]
      : [
          {
            source: templateSource,
            range: {
              start: existingNode.range[0],
              end: existingNode.key.range[1],
            },
          },
        ]),
    ...(hasValueUpdate
      ? existingNode.value && updatedNode.value
        ? [
            {
              source: templateSource,
              range: {
                start: existingNode.key.range[1],
                end: existingNode.value.range[0],
              },
            },
            escapeVueString(updatedNode.value.value),
            {
              source: templateSource,
              range: {
                start: existingNode.value.range[1],
                end: existingNode.range[1],
              },
            },
          ]
        : existingNode.value
        ? [
            {
              source: templateSource,
              range: {
                start: existingNode.value.range[1],
                end: existingNode.range[1],
              },
            },
          ]
        : updatedNode.value
        ? [
            `="${escapeVueString(updatedNode.value.value)}"`,
            {
              source: templateSource,
              range: {
                start: existingNode.key.range[1],
                end: existingNode.range[1],
              },
            },
          ]
        : [
            {
              source: templateSource,
              range: {
                start: existingNode.key.range[1],
                end: existingNode.range[1],
              },
            },
          ]
      : [
          {
            source: templateSource,
            range: {
              start: existingNode.key.range[1],
              end: existingNode.range[1],
            },
          },
        ]),
  ]);
}

function printVueDirectiveNode(
  node: AST.VDirective,
  previous: AST.VDirective,
  templateSource: string,
): string | null {
  // Generate the output code based on the existing node
  const existingNode = previous;
  const updatedNode = node;
  const hasKeyUpdate = (() => {
    try {
      return !areVueDirectiveNamesEqual(updatedNode.key, existingNode.key);
    } catch (error) {
      // FIXME: Expose errors when attempting to parse dynamic Vue binding keys
      return true;
    }
  })();
  const hasValueUpdate =
    updatedNode.value && existingNode.value
      ? (() => {
          try {
            return !areVueBindingExpressionsEqual(updatedNode.value, existingNode.value);
          } catch (error) {
            // FIXME: Expose errors when attempting to parse Vue binding expressions
            return true;
          }
        })()
      : updatedNode.value !== existingNode.value;
  if (!hasKeyUpdate && !hasValueUpdate) {
    return templateSource.slice(existingNode.range[0], existingNode.range[1]);
  }
  return mergeSourceChunks([
    ...(hasKeyUpdate
      ? [
          {
            source: templateSource,
            range: {
              start: existingNode.range[0],
              end: existingNode.key.range[0],
            },
          },
          escapeVueString(formatVueDirectiveName(updatedNode.key, templateSource)),
        ]
      : [
          {
            source: templateSource,
            range: {
              start: existingNode.range[0],
              end: existingNode.key.range[1],
            },
          },
        ]),
    ...(hasValueUpdate
      ? existingNode.value && updatedNode.value
        ? [
            {
              source: templateSource,
              range: {
                start: existingNode.key.range[1],
                end: existingNode.value.range[0],
              },
            },
            `"${escapeVueString(formatVueBindingExpression(updatedNode.value, templateSource))}"`,
            {
              source: templateSource,
              range: {
                start: existingNode.value.range[1],
                end: existingNode.range[1],
              },
            },
          ]
        : existingNode.value
        ? [
            {
              source: templateSource,
              range: {
                start: existingNode.value.range[1],
                end: existingNode.range[1],
              },
            },
          ]
        : updatedNode.value
        ? [
            `="${escapeVueString(formatVueBindingExpression(updatedNode.value, templateSource))}"`,
            {
              source: templateSource,
              range: {
                start: existingNode.key.range[1],
                end: existingNode.range[1],
              },
            },
          ]
        : [
            {
              source: templateSource,
              range: {
                start: existingNode.key.range[1],
                end: existingNode.range[1],
              },
            },
          ]
      : [
          {
            source: templateSource,
            range: {
              start: existingNode.key.range[1],
              end: existingNode.range[1],
            },
          },
        ]),
  ]);
}

function escapeVueString(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function areVueDirectiveNamesEqual(left: VDirectiveKey, right: VDirectiveKey): boolean {
  if (left === right) return true;
  if (left.name.name !== right.name.name) return false;
  if (!left.argument || !right.argument) return left.argument === right.argument;
  if (left.argument.type === 'VIdentifier' || right.argument.type === 'VIdentifier') {
    return (
      left.argument.type === 'VIdentifier' &&
      right.argument.type === 'VIdentifier' &&
      left.argument.name === right.argument.name
    );
  }
  return areVueBindingExpressionsEqual(left.argument, right.argument);
}

function areVueBindingExpressionsEqual(
  left: VExpressionContainer,
  right: VExpressionContainer,
): boolean {
  if (left === right) return true;
  if (left.expression === right.expression) return true;
  if (!left.expression || !right.expression) return false;
  if (left.expression.type !== right.expression.type) return false;
  const leftExpression = parseVueBindingExpression(left.expression);
  const rightExpression = parseVueBindingExpression(right.expression);
  return areESLintExpressionsEqual(leftExpression, rightExpression);
}

function parseVueBindingExpression(
  expression: NonNullable<VExpressionContainer['expression']>,
): ESLintExpression {
  switch (expression.type) {
    case 'VFilterSequenceExpression':
    case 'VForExpression':
    case 'VOnExpression':
    case 'VSlotScopeExpression':
    case 'VGenericExpression':
      throw new SyntaxError(`Unable to parse Vue binding expression: ${expression.type}`);
    default:
      return expression;
  }
}

function areESLintExpressionsEqual(left: ESLintExpression, right: ESLintExpression): boolean {
  if (left === right) return true;
  if (left.type !== right.type) return false;
  switch (left.type) {
    case 'Literal':
      return right.type === 'Literal' && left.value === right.value;
    case 'Identifier':
      return right.type === 'Identifier' && right.name === left.name;
    case 'UnaryExpression':
      return (
        right.type === 'UnaryExpression' &&
        right.operator === left.operator &&
        left.prefix === right.prefix &&
        areESLintExpressionsEqual(left.argument, right.argument)
      );
    default:
      // FIXME: support comparing all ESLint expression types
      throw new SyntaxError(`Unable to compare Vue expression: ${left.type}`);
  }
}

function formatVueDirectiveName(key: VDirectiveKey, templateSource: string): string {
  return `${key.name.rawName}${
    key.argument
      ? key.argument.type === 'VIdentifier'
        ? key.argument.name
        : `[${formatVueBindingExpression(key.argument, templateSource)}]`
      : ''
  }`;
}

function formatVueBindingExpression(binding: VExpressionContainer, templateSource: string): string {
  if (isUnmodifiedVueAstNode(binding)) {
    return templateSource.slice(binding.range[0], binding.range[1]);
  }
  if (!binding.expression) return '';
  switch (binding.expression.type) {
    case 'VFilterSequenceExpression':
    case 'VForExpression':
    case 'VOnExpression':
    case 'VSlotScopeExpression':
    case 'VGenericExpression':
      // FIXME: support formatting Vue binding expressions
      break;
    default:
      return formatESLintExpression(binding.expression, templateSource);
  }
  throw new SyntaxError(`Unable to print Vue binding expression: ${binding.expression.type}`);
}

function formatESLintExpression(expression: ESLintExpression, templateSource: string): string {
  if (isUnmodifiedVueAstNode(expression)) {
    return templateSource.slice(expression.range[0], expression.range[1]);
  }
  switch (expression.type) {
    case 'Literal':
      return String(expression.value);
    case 'Identifier':
      return expression.name;
    case 'UnaryExpression':
      if (expression.operator !== '!') break;
      return `!${formatESLintExpression(expression.argument, templateSource)}`;
    default:
      // FIXME: support formatting Vue expressions
      break;
  }
  throw new SyntaxError(`Unable to print Vue expression: ${expression.type}`);
}

export function isVueDirectiveAttribute(
  templateNode: VueTemplateNode<VAttribute | VDirective>,
): templateNode is VueTemplateNode<VDirective> {
  return templateNode.node.directive;
}

export function isVueAttributeAttribute(
  templateNode: VueTemplateNode<VAttribute | VDirective>,
): templateNode is VueTemplateNode<VAttribute> {
  return !templateNode.node.directive;
}

function isVueESLintLiteral(value: Node): value is ESLintLiteral {
  return value.type === 'Literal';
}

export function isVueESLintStringLiteral(value: Node): value is ESLintStringLiteral {
  return isVueESLintLiteral(value) && typeof value.value === 'string';
}

export function isVueESLintBooleanLiteral(value: Node): value is ESLintBooleanLiteral {
  return isVueESLintLiteral(value) && typeof value.value === 'boolean';
}

export function isVueESLintNullLiteral(value: Node): value is ESLintNullLiteral {
  return (
    isVueESLintLiteral(value) &&
    value.value === null &&
    value.regex === undefined &&
    value.bigint === undefined
  );
}

export function isVueESLintNumberLiteral(value: Node): value is ESLintNumberLiteral {
  return isVueESLintLiteral(value) && typeof value.value === 'number';
}

export function isVueESLintRegExpLiteral(value: Node): value is ESLintRegExpLiteral {
  return isVueESLintLiteral(value) && Boolean(value.regex);
}

export function isVueESLintBigIntLiteral(value: Node): value is ESLintBigIntLiteral {
  return isVueESLintLiteral(value) && typeof value.bigint === 'string';
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

export function invertVueBooleanExpression(value: ESLintExpression): ESLintExpression {
  const existingTruthinessValue = isVueESLintNullLiteral(value)
    ? false
    : isVueESLintBooleanLiteral(value) ||
      isVueESLintStringLiteral(value) ||
      isVueESLintNumberLiteral(value)
    ? value.value
    : null;
  if (typeof existingTruthinessValue === 'boolean') {
    const invertedValue = !existingTruthinessValue;
    return createVueBooleanLiteral(invertedValue);
  } else {
    return createVueAstNode({
      type: 'UnaryExpression',
      operator: '!',
      prefix: true,
      argument: value,
    });
  }
}

export function createVueBooleanLiteral(value: boolean): ESLintBooleanLiteral {
  return createVueAstNode({
    type: 'Literal',
    value: value,
    raw: String(value),
  }) as ESLintBooleanLiteral;
}

export function getVueExpressionContainerExpression(
  node: VExpressionContainer,
): ESLintExpression | null {
  if (!node.expression) return null;
  switch (node.expression.type) {
    case 'VFilterSequenceExpression':
    case 'VForExpression':
    case 'VOnExpression':
    case 'VSlotScopeExpression':
    case 'VGenericExpression':
      return null;
    default:
      return node.expression;
  }
}

export function createVueExpressionContainer(
  value: VExpressionContainer['expression'],
  references?: Array<Reference>,
): VExpressionContainer {
  return createVueAstNode({
    type: 'VExpressionContainer',
    expression: value,
    references: references || [],
  });
}
