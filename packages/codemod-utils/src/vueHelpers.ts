import {
  getFunctionReturnValues,
  getLiteralPropertyKey,
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
import { Enum, VARIANT, nonNull } from '@ag-grid-devtools/utils';
import { parse } from 'vue-eslint-parser';
import { AST } from 'vue-eslint-parser';

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
type OffsetRange = AST.OffsetRange;
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

export interface VueTemplateNode<T extends Node = Node> {
  node: T;
  path: VueTemplatePath;
  template: VueTemplateSource;
}

export interface VueTemplateSource {
  source: string;
  root: VElement;
  omitRootTag: boolean;
  mutations: Array<VueTemplateMutation>;
}

type VueTemplateMutation = Enum<{
  ReplaceChild: {
    path: VueTemplatePath;
    value: Node | null;
  };
  RemoveListChild: {
    path: VueTemplatePath;
  };
  ReplaceListChild: {
    path: VueTemplatePath;
    value: Node;
  };
}>;

const VueTemplateMutation = Enum.create<VueTemplateMutation>({
  ReplaceChild: true,
  RemoveListChild: true,
  ReplaceListChild: true,
});

export type VueTemplatePath = Array<PropertyKey>;

export interface VueTemplateVisitor {
  enter(node: VueTemplateNode<Node>): void;
  leave(node: VueTemplateNode<Node>): void;
}

export type VueNodeMatcher<T extends Node> = (node: Node, path: VueTemplatePath) => node is T;

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
      source: componentSource,
      root: template,
      omitRootTag: true,
      mutations: [],
    },
    node: template,
    path: [],
  };
}

export function createVueAstNode<T extends Node['type']>(
  properties: { type: T } & Omit<
    Extract<Node, { type: T }>,
    'type' | keyof HasParent | keyof HasLocation
  >,
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

export function replaceVueTemplateNode<T extends Node>(
  target: VueTemplateNode,
  replacement: T,
): VueTemplateNode<T> {
  const { path, template } = target;
  template.mutations.push(VueTemplateMutation.ReplaceChild({ path, value: replacement }));
  return { node: replacement, path, template };
}

export function removeVueTemplateNode(target: VueTemplateNode): void {
  const { path, template } = target;
  const key = path.length > 0 ? path[path.length - 1] : null;
  if (typeof key === 'number') {
    template.mutations.push(VueTemplateMutation.RemoveListChild({ path }));
  } else {
    template.mutations.push(VueTemplateMutation.ReplaceChild({ path, value: null }));
  }
}

export function printVueTemplate(ast: VueTemplateNode<VElement>): string | null {
  const { template, path } = ast;
  const { omitRootTag } = template;
  const rootPaths =
    omitRootTag && path.length === 0
      ? template.root.children.map((_, index) => ['children', index])
      : [path];
  const chunkSets = rootPaths.map((path) => {
    const original = path.reduce(
      (root, childKey) => (root && root[childKey as keyof typeof root]) || null,
      template.root as Node | Array<Node> | null,
    );
    if (!original || Array.isArray(original)) return null;
    const mutations = path.reduce(
      (mutations, childKey) => (mutations && mutations.children.get(childKey)) || null,
      generateMutationTree(template.mutations),
    );
    return formatUpdatedNode(original, path, mutations, template.source);
  });
  if (!chunkSets.every(Boolean)) return null;
  return mergeSourceChunks(chunkSets.flatMap((chunks) => chunks || []));
}

type SourceChunk = string | { source: VueTemplateSource['source']; range: Node['range'] };

function mergeSourceChunks(chunks: Array<SourceChunk>): string {
  const { completed, pending } = chunks.reduce(
    (
      { pending, completed },
      chunk,
    ): {
      completed: Array<string>;
      pending: { source: VueTemplateSource['source']; range: OffsetRange } | null;
    } => {
      if (typeof chunk === 'string') {
        if (pending) completed.push(pending.source.slice(pending.range[0], pending.range[1]));
        completed.push(chunk);
        return { completed, pending: null };
      } else {
        if (!pending) {
          return { completed, pending: chunk };
        } else if (
          pending &&
          pending.source === chunk.source &&
          pending.range[1] === chunk.range[0]
        ) {
          return {
            completed,
            pending: { source: pending.source, range: [pending.range[0], chunk.range[1]] },
          };
        } else {
          completed.push(pending.source.slice(pending.range[0], pending.range[1]));
          return { completed, pending: chunk };
        }
      }
    },
    {
      completed: new Array<string>(),
      pending: null as { source: VueTemplateSource['source']; range: OffsetRange } | null,
    },
  );
  if (pending) completed.push(pending.source.slice(pending.range[0], pending.range[1]));
  return completed.join('');
}

interface MutationTree {
  mutations: Array<VueTemplateMutation>;
  children: Map<PropertyKey, MutationTree>;
}

function generateMutationTree(mutations: Array<VueTemplateMutation>): MutationTree | null {
  if (mutations.length === 0) return null;
  return mutations.reduce(
    (tree, mutation) => {
      const { path } = mutation;
      const childTree = path.reduce((tree, key) => {
        const existingChildTree = tree.children.get(key);
        const childTree: MutationTree = existingChildTree || {
          mutations: [],
          children: new Map(),
        };
        if (!existingChildTree) tree.children.set(key, childTree);
        return childTree;
      }, tree);
      childTree.mutations.push(mutation);
      return tree;
    },
    {
      mutations: [],
      children: new Map(),
    } as MutationTree,
  );
}

function formatUpdatedNode(
  node: Node,
  path: VueTemplatePath,
  pathMutations: MutationTree | null,
  source: VueTemplateSource['source'],
): Array<SourceChunk> {
  const { range } = node;
  if (!pathMutations) return [{ source, range }];
  const pathMutation =
    pathMutations.mutations.length > 0
      ? pathMutations.mutations[pathMutations.mutations.length - 1]
      : null;
  if (pathMutation) {
    switch (pathMutation[VARIANT]) {
      case 'ReplaceChild':
      case 'ReplaceListChild': {
        const { value } = pathMutation;
        return value ? [printVueNode(value)] : [];
      }
      case 'RemoveListChild':
        return [];
    }
  }
  const childKeys = KEYS[node.type] as
    | Array<Exclude<keyof Node, 'type' | keyof HasLocation>>
    | undefined;
  if (!childKeys) return [{ source, range }];
  const childSlots = childKeys
    .flatMap((childKey) => {
      const originalChild = node[childKey];
      return Array.isArray(originalChild)
        ? originalChild.map((child, index) => {
            const [startIndex, endIndex] = (child as Node).range;
            return { path: [childKey, index], start: startIndex, end: endIndex };
          })
        : isNode(originalChild)
        ? [{ path: [childKey], start: originalChild.range[0], end: originalChild.range[1] }]
        : [];
    })
    .sort((a, b) => a.start - b.start);
  if (childSlots.length === 0) return [{ source, range }];
  const [startOffset, endOffset] = range;
  const templateElements = childSlots.flatMap(
    (
      slot,
      index,
      array,
    ): Array<{ start: OffsetRange[1]; end: OffsetRange[1]; path: Array<PropertyKey> | null }> => {
      const previousSlot = index === 0 ? null : array[index - 1];
      const previousLiteral = {
        start: previousSlot ? previousSlot.end : startOffset,
        end: slot.start,
        path: null,
      };
      const nextLiteral =
        index === array.length - 1 ? { start: slot.end, end: endOffset, path: null } : null;
      return [previousLiteral, slot, ...(nextLiteral ? [nextLiteral] : [])];
    },
  );
  return templateElements.flatMap(({ path: childPath, start, end }): Array<SourceChunk> => {
    const childMutations = childPath
      ? childPath.reduce(
          (mutations, key) => (mutations && mutations.children.get(key)) || null,
          pathMutations as MutationTree | null,
        )
      : null;
    const child = childPath
      ? childPath.reduce(
          (node, key) => (node && node[key as keyof typeof node]) || null,
          node as Node | Array<Node> | null,
        )
      : null;
    if (!childPath || !child || Array.isArray(child)) return [{ source, range: [start, end] }];
    return formatUpdatedNode(child, [...path, ...childPath], childMutations, source);
  });
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

export function findVueTemplateNodes<T extends Node>(
  root: VueTemplateNode<any>,
  predicate: VueNodeMatcher<T>,
): Array<VueTemplateNode<T>> {
  const visitor = new TemplateNodeMatcherVisitor(predicate);
  traverseVueTemplate(root, visitor);
  return visitor.results;
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
  const { node, path, template } = templateNode;
  const child = node[key];
  if (Array.isArray(child)) {
    return child.map((child, index) => ({
      node: child,
      path: [...path, key, index],
      template,
    })) as any;
  } else if (isNode(child)) {
    return { node: child, path: [...path, key], template } as any;
  } else {
    return null as any;
  }
}

function traverseVueTemplate(
  templateNode: VueTemplateNode<Node>,
  visitor: VueTemplateVisitor,
): void {
  /* Based on https://github.com/vuejs/vue-eslint-parser/blob/master/src/ast/traverse.ts */

  visitor.enter(templateNode);

  const { template, node, path } = templateNode;
  const { type: nodeType } = node;
  const keys = (KEYS[nodeType] || getFallbackKeys(node)) as Array<keyof typeof node>;
  keys.forEach((key) => {
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach((child, index) => {
        if (isNode(child)) {
          const childPath = [...path, key, index];
          traverseVueTemplate({ template, node: child, path: childPath }, visitor);
        }
      });
    } else if (isNode(child)) {
      const childPath = [...path, key];
      traverseVueTemplate({ template, node: child, path: childPath }, visitor);
    }
  });

  visitor.leave(templateNode);
}

function isNode(x: any): x is Node {
  return x !== null && typeof x === 'object' && typeof x.type === 'string';
}

class TemplateNodeMatcherVisitor<T extends Node> implements VueTemplateVisitor {
  public results: Array<VueTemplateNode<T>> = [];
  constructor(private predicate: VueNodeMatcher<T>) {}
  enter(templateNode: VueTemplateNode): void {
    const { template, node, path } = templateNode;
    if (this.predicate(node, path)) this.results.push({ template, node, path });
  }
  leave(templateNode: VueTemplateNode): void {}
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

function element(predicate?: (element: VElement) => boolean): VueNodeMatcher<VElement> {
  return (node: Node): node is VElement => {
    if (node.type !== 'VElement') return false;
    if (!predicate) return true;
    return predicate(node);
  };
}

function expression(
  predicate?: (expression: VExpressionContainer) => boolean,
): VueNodeMatcher<VExpressionContainer> {
  return (node: Node): node is VExpressionContainer => {
    if (node.type !== 'VExpressionContainer') return false;
    if (!predicate) return true;
    return predicate(node);
  };
}

function text(predicate?: (text: VText) => boolean): VueNodeMatcher<VText> {
  return (node: Node): node is VText => {
    if (node.type !== 'VText') return false;
    if (!predicate) return true;
    return predicate(node);
  };
}
