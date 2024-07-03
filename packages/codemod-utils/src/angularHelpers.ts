import {
  findNamedClassMemberAccessorExpressions,
  getNamedModuleImportExpression,
  node as t,
  type AstTransformContext,
  type FsContext,
  type FileMetadata,
  type NodePath,
  type Types,
  TransformContext,
} from '@ag-grid-devtools/ast';
import { Enum, match } from '@ag-grid-devtools/utils';
import {
  RecursiveAstVisitor,
  TmplAstRecursiveVisitor,
  type AST,
  type ASTWithSource,
  type Call,
  type PropertyRead,
  type TmplAstElement,
  type TmplAstNode,
} from '@angular-eslint/bundled-angular-compiler';
import { parse } from '@angular-eslint/template-parser';
import { TSESTree } from '@typescript-eslint/types';
import * as Angular from '@angular-eslint/bundled-angular-compiler';
import path from 'node:path';

import {
  findTemplateNodes,
  getTemplateNodeChild,
  mergeSourceChunks,
  printTemplate,
  SourceChunk,
  type TemplateEngine,
  type TemplateFormatter,
  type TemplateMutation,
  type TemplateNode,
  type TemplateNodeMatcher,
  type TemplateRange,
  type TemplateVisitor,
} from './templateHelpers';

export * as Angular from '@angular-eslint/bundled-angular-compiler';
export { TSESTree } from '@typescript-eslint/types';

export enum BindingType {
  Property = 0 as Angular.BindingType.Property,
  Attribute = 1 as Angular.BindingType.Attribute,
  Class = 2 as Angular.BindingType.Class,
  Style = 3 as Angular.BindingType.Style,
  Animation = 4 as Angular.BindingType.Animation,
}

export enum SecurityContext {
  NONE = 0 as Angular.core.SecurityContext.NONE,
  HTML = 1 as Angular.core.SecurityContext.HTML,
  STYLE = 2 as Angular.core.SecurityContext.STYLE,
  SCRIPT = 3 as Angular.core.SecurityContext.SCRIPT,
  URL = 4 as Angular.core.SecurityContext.URL,
  RESOURCE_URL = 5 as Angular.core.SecurityContext.RESOURCE_URL,
}

export type AngularAstNode = TmplAST | TmplAstNode;

export interface TmplAST extends TSESTree.Program {
  templateNodes: Array<TmplAstNode>;
}

type Class = Types.Class;
type ClassProperty = Types.ClassProperty;
type Decorator = Types.Decorator;
type Expression = Types.Expression;
type MemberExpression = Types.MemberExpression;
type OptionalMemberExpression = Types.OptionalMemberExpression;
type ObjectExpression = Types.ObjectExpression;
type ObjectProperty = Types.ObjectProperty;
type Property = Types.Property;
type TemplateLiteral = Types.TemplateLiteral;

const ANGULAR_PACKAGE_NAME = '@angular/core';
const ANGULAR_COMPONENT_DECORATOR_IMPORT_NAME = 'Component';
const ANGULAR_COMPONENT_METADATA_TEMPLATE_FIELD_NAME = 'template';
const ANGULAR_COMPONENT_METADATA_TEMPLATE_URL_FIELD_NAME = 'templateUrl';
const ANGULAR_VIEW_CHILD_DECORATOR_IMPORT_NAME = 'ViewChild';

export interface AngularTemplateNodeType<T extends TmplAstNode = TmplAstNode> {
  new (...args: Array<any>): T;
}

export interface AngularExpressionNodeType<T extends Angular.AST = Angular.AST> {
  new (...args: Array<any>): T;
}

export type AngularComponentTemplateDefinition = Enum<{
  Inline: {
    value: NodePath<Expression>;
    source: string;
  };
  External: {
    templateUrl: string;
    source: string;
  };
}>;
export const AngularComponentTemplateDefinition = Enum.create<AngularComponentTemplateDefinition>({
  Inline: true,
  External: true,
});

export function parseAngularComponentTemplate(
  component: NodePath<Class>,
  context: AstTransformContext<FsContext>,
): {
  metadata: AngularComponentTemplateDefinition;
  template: AngularTemplateNode<TmplAST>;
} | null {
  const { filename: filePath = './component.html' } = context;
  const componentMetadata = getAngularComponentMetadata(component, context);
  if (!componentMetadata) return null;
  const templateDefinition = getAngularComponentTemplateDefinition(componentMetadata, context);
  if (!templateDefinition) return null;
  const ast = parse(templateDefinition.source, {
    filePath,
    suppressParseErrors: false,
  }) as any as TmplAST;
  return {
    metadata: templateDefinition,
    template: {
      node: ast,
      path: [],
      template: {
        engine: new AngularTemplateEngine(),
        source: templateDefinition.source,
        root: ast,
        mutations: [],
      },
    },
  };
}

export function updateAngularComponentTemplate(
  templateDefinition: AngularComponentTemplateDefinition,
  template: AngularTemplateNode<TmplAST>,
  context: AstTransformContext<FsContext>,
): void {
  match(templateDefinition, {
    Inline: ({ value }) => {
      const templateSource = printTemplate(template, new AngularTemplateFormatter());
      if (!templateSource) return;
      if (value.isStringLiteral() && !templateSource.includes('\n')) {
        value.replaceWith(t.stringLiteral(templateSource));
      } else {
        value.replaceWith(t.templateLiteral([t.templateElement({ raw: templateSource })], []));
      }
    },
    External: ({ templateUrl }) => {
      const templatePath = getAngularComponentExternalTemplatePath(templateUrl, context);
      if (!templatePath) return;
      const templateSource = printTemplate(template, new AngularTemplateFormatter());
      if (!templateSource) return;
      const { fs } = context.opts;
      try {
        fs.writeFileSync(templatePath, templateSource);
      } catch (error) {
        throw new Error(
          [
            `Failed to update Angular component template: ${templatePath}`,
            ...(context.filename ? [`  in component ${context.filename}`] : []),
          ].join('\n'),
          {
            cause: error,
          },
        );
      }
    },
  });
}

function getAngularComponentTemplateDefinition(
  metadata: NodePath<ObjectExpression>,
  context: AstTransformContext<FsContext>,
): AngularComponentTemplateDefinition | null {
  const templateValue = getAngularComponentMetadataNamedFieldValue(
    metadata,
    ANGULAR_COMPONENT_METADATA_TEMPLATE_FIELD_NAME,
  );
  if (templateValue) {
    const templateSource = getStringExpressionValue(templateValue);
    if (!templateSource) return null;
    return AngularComponentTemplateDefinition.Inline({
      value: templateValue,
      source: templateSource,
    });
  }
  const templateUrlValue = getAngularComponentMetadataNamedFieldValue(
    metadata,
    ANGULAR_COMPONENT_METADATA_TEMPLATE_URL_FIELD_NAME,
  );
  if (templateUrlValue) {
    const templateUrl = getStringExpressionValue(templateUrlValue);
    if (!templateUrl) return null;
    const templatePath = getAngularComponentExternalTemplatePath(templateUrl, context);
    if (!templatePath) return null;
    const templateSource = (() => {
      const { fs } = context.opts;
      try {
        return fs.readFileSync(templatePath, 'utf-8');
      } catch (error) {
        throw new Error(
          [
            `Failed to load Angular component template: ${templatePath}`,
            `  in component ${context.filename}`,
          ].join('\n'),
          {
            cause: error,
          },
        );
      }
    })();
    return AngularComponentTemplateDefinition.External({
      templateUrl,
      source: templateSource,
    });
  }
  // FIXME: warn when unable to parse Angular component template
  return null;
}

export function getAngularComponentExternalTemplatePath(
  templateUrl: string,
  context: FileMetadata,
): string | null {
  // FIXME: confirm assumptions on what constitutes a valid Angular templateUrl
  // FIXME: warn when unable to load Angular component template
  if (!templateUrl || !templateUrl.startsWith('.')) return null;
  const currentPath = context.filename ? path.dirname(context.filename) : '.';
  return path.join(currentPath, templateUrl);
}

export interface AngularTemplateNode<T extends AngularAstNode>
  extends TemplateNode<T, TmplAST, AngularAstNode> {}

export type AngularTemplateMutation = TemplateMutation<AngularAstNode>;

export type AngularTemplateNodeMatcher<T extends AngularAstNode> = TemplateNodeMatcher<
  T,
  TmplAST,
  AngularAstNode
>;

export type AngularTemplateVisitor = TemplateVisitor<TmplAST, AngularAstNode>;

const TEMPLATE_VISITOR_KEYS = new Map<string, Array<PropertyKey>>([
  [Angular.TmplAstBoundAttribute.name, ['value']],
  [Angular.TmplAstBoundDeferredTrigger.name, ['value']],
  [Angular.TmplAstBoundEvent.name, ['handler']],
  [Angular.TmplAstBoundText.name, ['value']],
  [Angular.TmplAstContent.name, ['attributes']],
  [
    Angular.TmplAstDeferredBlock.name,
    ['children', 'triggers', 'prefetchTriggers', 'placeholder', 'loading', 'error'],
  ],
  [Angular.TmplAstDeferredBlockError.name, ['children']],
  [Angular.TmplAstDeferredBlockLoading.name, ['children']],
  [Angular.TmplAstDeferredBlockPlaceholder.name, ['children']],
  [Angular.TmplAstElement.name, ['attributes', 'inputs', 'outputs', 'children', 'references']],
  [Angular.TmplAstHoverDeferredTrigger.name, []],
  [Angular.TmplAstIcu.name, ['vars', 'placeholders']],
  [Angular.TmplAstIdleDeferredTrigger.name, []],
  [Angular.TmplAstImmediateDeferredTrigger.name, []],
  [Angular.TmplAstInteractionDeferredTrigger.name, []],
  [Angular.TmplAstReference.name, []],
  [
    Angular.TmplAstTemplate.name,
    ['attributes', 'inputs', 'outputs', 'templateAttrs', 'children', 'references', 'variables'],
  ],
  [Angular.TmplAstText.name, []],
  [Angular.TmplAstTextAttribute.name, []],
  [Angular.TmplAstTimerDeferredTrigger.name, []],
  [Angular.TmplAstVariable.name, []],
  [Angular.TmplAstViewportDeferredTrigger.name, []],
]);

const AST_VISITOR_KEYS = new Map<string, Array<PropertyKey>>([
  [Angular.ASTWithSource.name, ['ast']],
  [Angular.Binary.name, ['left', 'right']],
  [Angular.BindingPipe.name, ['exp', 'args']],
  [Angular.Call.name, ['receiver', 'args']],
  [Angular.Chain.name, ['expressions']],
  [Angular.Conditional.name, ['condition', 'trueExp', 'falseExp']],
  [Angular.EmptyExpr.name, []],
  [Angular.ImplicitReceiver.name, []],
  [Angular.Interpolation.name, ['expressions']],
  [Angular.KeyedRead.name, ['receiver', 'key']],
  [Angular.KeyedWrite.name, ['receiver', 'key', 'value']],
  [Angular.LiteralArray.name, ['expressions']],
  [Angular.LiteralMap.name, ['values']],
  [Angular.LiteralPrimitive.name, []],
  [Angular.NonNullAssert.name, ['expression']],
  [Angular.PrefixNot.name, ['expression']],
  [Angular.PropertyRead.name, ['receiver']],
  [Angular.PropertyWrite.name, ['receiver', 'value']],
  [Angular.SafeCall.name, ['receiver', 'args']],
  [Angular.SafeKeyedRead.name, ['receiver', 'key']],
  [Angular.SafePropertyRead.name, ['receiver']],
  [Angular.Unary.name, ['expr']],
]);

const VISITOR_KEYS = new Map<string, Array<PropertyKey>>([
  ...TEMPLATE_VISITOR_KEYS,
  ...AST_VISITOR_KEYS,
]);

type AngularNodeMetadataKey = Extract<keyof AngularAstNode, 'sourceSpan' | 'visit'>;

export class AngularTemplateEngine implements TemplateEngine<AngularAstNode> {
  getNodeChildKeys(node: AngularAstNode): ReadonlyArray<PropertyKey> | null {
    if (isAngularAstRootNode(node)) return ['templateNodes'];
    const nodeConstructor = node.constructor as new (...args: any) => any;
    return VISITOR_KEYS.get(nodeConstructor.name) || null;
  }
  getNodeChild(
    parent: AngularAstNode,
    childKey: PropertyKey,
  ): AngularAstNode | Array<AngularAstNode> | null {
    const child = parent[childKey as Exclude<keyof AngularAstNode, AngularNodeMetadataKey>];
    if (!child) return null;
    if (Array.isArray(child)) return child;
    if (isNode(child)) return child;
    return null;
  }
}

export class AngularTemplateFormatter implements TemplateFormatter<TmplAST, AngularAstNode> {
  getRootNode(root: TmplAST): AngularAstNode {
    return root;
  }
  getNodeRange(node: AngularAstNode): TemplateRange {
    if (isAngularAstRootNode(node)) return { start: node.range[0], end: node.range[1] };
    return { start: node.sourceSpan.start.offset, end: node.sourceSpan.end.offset };
  }
  printNode(node: AngularAstNode, previous: AngularAstNode | null, templateSource: string): string {
    return printAngularNode(node, previous, templateSource);
  }
}

export function getAngularTemplateNodeChild<
  T extends AngularAstNode & { [ChildKey in K]: AngularAstNode | null | Array<AngularAstNode> },
  K extends keyof T,
>(
  templateNode: AngularTemplateNode<T>,
  key: K,
): T[K] extends AngularAstNode
  ? AngularTemplateNode<T[K]>
  : T[K] extends AngularAstNode | null
    ? AngularTemplateNode<Extract<T[K], AngularAstNode>> | null
    : T[K] extends Array<AngularAstNode>
      ? Array<AngularTemplateNode<T[K][number]>>
      : never {
  return getTemplateNodeChild(templateNode, key) as any;
}

function isNode(x: any): x is AngularAstNode {
  return x !== null && typeof x === 'object' && typeof x.visit === 'function';
}

export function isAngularAstRootNode(node: AngularAstNode): node is TmplAST {
  return node.constructor === Object && (node as TSESTree.Node).type === 'Program';
}

export function isTypedAngularAstNode<T extends TmplAstNode>(
  nodeType: AngularTemplateNodeType<T>,
  node: AngularAstNode,
): node is T {
  return !isAngularAstRootNode(node) && node.constructor.name === (nodeType as Function).name;
}

export function isTypedAngularExpressionNode<T extends Angular.AST>(
  nodeType: AngularExpressionNodeType<T>,
  node: Angular.AST,
): node is T {
  return node.constructor.name === (nodeType as Function).name;
}

export function isTypedAngularTemplateNode<T extends TmplAstNode>(
  nodeType: AngularTemplateNodeType<T>,
  templateNode: AngularTemplateNode<AngularAstNode>,
): templateNode is AngularTemplateNode<T> {
  const { node } = templateNode;
  return isTypedAngularAstNode(nodeType, node);
}

export function getAngularExpressionRoot(node: Angular.AST): Angular.AST {
  if (isTypedAngularExpressionNode(Angular.ASTWithSource, node)) return node.ast;
  return node;
}

function printAngularNode(
  node: AngularAstNode,
  previous: AngularAstNode | null,
  templateSource: string,
): string {
  switch (node.constructor.name) {
    // FIXME: format all Angular element attribute node types
    case Angular.TmplAstTextAttribute.name: {
      const result = printAngularTextAttributeNode(
        node as Angular.TmplAstTextAttribute,
        previous,
        templateSource,
      );
      if (typeof result === 'string') return result;
      break;
    }
    case Angular.TmplAstBoundAttribute.name: {
      const result = printAngularBoundAttributeNode(
        node as Angular.TmplAstBoundAttribute,
        previous,
        templateSource,
      );
      if (typeof result === 'string') return result;
      break;
    }
    case Angular.TmplAstBoundEvent.name: {
      const result = printAngularBoundEventNode(
        node as Angular.TmplAstBoundEvent,
        previous,
        templateSource,
      );
      if (typeof result === 'string') return result;
      break;
    }
    default:
      // FIXME: format all Angular AST node types
      break;
  }
  throw new Error(`Unable to format node type: ${node.constructor.name}`);
}

function printAngularTextAttributeNode(
  node: Angular.TmplAstTextAttribute,
  previous: AngularAstNode | null,
  templateSource: string,
): string | null {
  // If the node already exists, generate the output code based on the existing node
  if (previous && previous.constructor.name === node.constructor.name) {
    return patchExistingAngularTextAttributeNode(
      node,
      previous as Angular.TmplAstTextAttribute,
      templateSource,
    );
  }
  // Otherwise print the node from scratch
  return formatAngularTextAttributeNode(node);
}

function patchExistingAngularTextAttributeNode(
  updatedNode: Angular.TmplAstTextAttribute,
  existingNode: Angular.TmplAstTextAttribute,
  templateSource: string,
): string | null {
  const hasKeyUpdate = updatedNode.name !== existingNode.name;
  const hasValueUpdate = updatedNode.value !== existingNode.value;
  // If the node is identical to the existing node, return the existing source
  if (!hasKeyUpdate && !hasValueUpdate) {
    return templateSource.slice(
      existingNode.sourceSpan.start.offset,
      existingNode.sourceSpan.end.offset,
    );
  }
  // Otherwise print the node from scratch
  return formatAngularTextAttributeNode(updatedNode);
}

function formatAngularTextAttributeNode(node: Angular.TmplAstTextAttribute): string {
  const isShorthandBooleanAttribute = !node.value && !node.valueSpan;
  if (isShorthandBooleanAttribute) return node.name;
  return `${node.name}="${escapeAngularString(node.value)}"`;
}

function printAngularBoundAttributeNode(
  node: Angular.TmplAstBoundAttribute,
  previous: AngularAstNode | null,
  templateSource: string,
): string | null {
  // If the node already exists, generate the output code based on the existing node
  if (previous && previous.constructor.name === node.constructor.name) {
    return patchExistingAngularBoundAttributeNode(
      node,
      previous as Angular.TmplAstBoundAttribute,
      templateSource,
    );
  }
  // Otherwise print the node from scratch
  return formatAngularBoundAttributeNode(node, templateSource);
}

function patchExistingAngularBoundAttributeNode(
  updatedNode: Angular.TmplAstBoundAttribute,
  existingNode: Angular.TmplAstBoundAttribute,
  templateSource: string,
): string | null {
  const hasKeyUpdate = updatedNode.name !== existingNode.name;
  const hasValueUpdate = updatedNode.value !== existingNode.value;
  if (!hasKeyUpdate && !hasValueUpdate) {
    return templateSource.slice(
      existingNode.sourceSpan.start.offset,
      existingNode.sourceSpan.end.offset,
    );
  }
  return mergeSourceChunks([
    ...(hasKeyUpdate
      ? [
          {
            source: templateSource,
            range: {
              start: existingNode.sourceSpan.start.offset,
              end: existingNode.keySpan.start.offset,
            },
          },
          updatedNode.name,
          {
            source: templateSource,
            range: {
              start: existingNode.keySpan.end.offset,
              end: existingNode.valueSpan
                ? existingNode.valueSpan.start.offset
                : existingNode.sourceSpan.end.offset,
            },
          },
        ]
      : [
          {
            source: templateSource,
            range: {
              start: existingNode.sourceSpan.start.offset,
              end: existingNode.valueSpan
                ? existingNode.valueSpan.start.offset
                : existingNode.sourceSpan.end.offset,
            },
          },
        ]),
    ...(hasValueUpdate
      ? existingNode.valueSpan
        ? [
            formatAngularExpression(updatedNode.value, templateSource),
            {
              source: templateSource,
              range: {
                start: existingNode.valueSpan.end.offset,
                end: existingNode.sourceSpan.end.offset,
              },
            },
          ]
        : [`="${formatAngularExpression(updatedNode.value, templateSource)}"`]
      : existingNode.valueSpan
        ? [
            {
              source: templateSource,
              range: {
                start: existingNode.valueSpan.start.offset,
                end: existingNode.sourceSpan.end.offset,
              },
            },
          ]
        : []),
  ]);
}

function formatAngularBoundAttributeNode(
  node: Angular.TmplAstBoundAttribute,
  templateSource: string,
): string | null {
  return `[${node.name}]="${formatAngularExpression(node.value, templateSource)}"`;
}

function printAngularBoundEventNode(
  node: Angular.TmplAstBoundEvent,
  previous: AngularAstNode | null,
  templateSource: string,
): string | null {
  // If the node already exists, generate the output code based on the existing node
  if (previous && previous.constructor.name === node.constructor.name) {
    return patchExistingAngularBoundEventNode(
      node,
      previous as Angular.TmplAstBoundEvent,
      templateSource,
    );
  }
  // Otherwise print the node from scratch
  return formatAngularBoundEventNode(node, templateSource);
}

function patchExistingAngularBoundEventNode(
  updatedNode: Angular.TmplAstBoundEvent,
  existingNode: Angular.TmplAstBoundEvent,
  templateSource: string,
): string | null {
  const hasKeyUpdate = updatedNode.name !== existingNode.name;
  const hasValueUpdate = updatedNode.handler !== existingNode.handler;
  if (!hasKeyUpdate && !hasValueUpdate) {
    return templateSource.slice(
      existingNode.sourceSpan.start.offset,
      existingNode.sourceSpan.end.offset,
    );
  }
  return mergeSourceChunks([
    ...(hasKeyUpdate
      ? [
          {
            source: templateSource,
            range: {
              start: existingNode.sourceSpan.start.offset,
              end: existingNode.keySpan.start.offset,
            },
          },
          updatedNode.name,
          {
            source: templateSource,
            range: {
              start: existingNode.keySpan.end.offset,
              end: existingNode.handlerSpan.start.offset,
            },
          },
        ]
      : [
          {
            source: templateSource,
            range: {
              start: existingNode.sourceSpan.start.offset,
              end: existingNode.handlerSpan.start.offset,
            },
          },
        ]),
    ...(hasValueUpdate
      ? [
          formatAngularExpression(updatedNode.handler, templateSource),
          {
            source: templateSource,
            range: {
              start: existingNode.handlerSpan.end.offset,
              end: existingNode.sourceSpan.end.offset,
            },
          },
        ]
      : [
          {
            source: templateSource,
            range: {
              start: existingNode.handlerSpan.start.offset,
              end: existingNode.sourceSpan.end.offset,
            },
          },
        ]),
  ]);
}

function formatAngularBoundEventNode(
  node: Angular.TmplAstBoundEvent,
  templateSource: string,
): string | null {
  return `(${node.name})="${formatAngularExpression(node.handler, templateSource)}"`;
}

function escapeAngularString(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatAngularExpression(expression: Angular.AST, templateSource: string): string {
  const unmodifiedSourceSpan: Angular.AbsoluteSourceSpan | undefined = expression.sourceSpan;
  if (unmodifiedSourceSpan) {
    return templateSource.slice(unmodifiedSourceSpan.start, unmodifiedSourceSpan.end);
  }
  switch (expression.constructor.name) {
    case Angular.LiteralPrimitive.name:
      return String((expression as Angular.LiteralPrimitive).value);
    case Angular.PropertyRead.name:
      return (expression as Angular.PropertyRead).name;
    case Angular.PrefixNot.name:
      return `!${formatAngularExpression(
        (expression as Angular.PrefixNot).expression,
        templateSource,
      )}`;
    default:
      throw new Error(`Unable to format Angular expression: ${expression.constructor.name}`);
  }
}

function getStringExpressionValue(value: NodePath<Expression>): string | null {
  if (value.isStringLiteral()) return value.node.value;
  if (value.isTemplateLiteral()) return getStaticTemplateLiteralValue(value);
  return null;
}

function getStaticTemplateLiteralValue(fieldValue: NodePath<TemplateLiteral>): string | null {
  const literalSegments = fieldValue.node.quasis;
  const expressionSegments = fieldValue.node.expressions;
  if (expressionSegments.length > 0 || literalSegments.length !== 1) return null;
  const [literal] = literalSegments;
  return getTemplateLiteralQuasiSource(literal);
}

function getTemplateLiteralQuasiSource(literal: Types.TemplateElement): string | null {
  if (typeof literal.value.cooked === 'string') return literal.value.cooked;
  return literal.value.raw;
}

function getAngularComponentMetadataNamedFieldValue(
  metadata: NodePath<ObjectExpression>,
  fieldName: string,
): NodePath<Expression> | null {
  const matchingPropertyValues = metadata
    .get('properties')
    .filter((property): property is NodePath<ObjectProperty> => {
      if (!property.isObjectProperty()) return false;
      const key = property.get('key');
      if (!key.isIdentifier()) return false;
      return key.node.name === fieldName;
    })
    .map((property) => {
      const value = property.get('value');
      if (!value.isExpression()) return null;
      return value;
    })
    .filter(Boolean);
  if (matchingPropertyValues.length === 0) return null;
  const [value] = matchingPropertyValues;
  return value;
}

export function getAngularComponentMetadata(
  component: NodePath<Class>,
  context: AstTransformContext<TransformContext>,
): NodePath<ObjectExpression> | null {
  const decorators = component.get('decorators');
  if (!decorators || !Array.isArray(decorators)) return null;
  const componentDecorators = decorators
    .map((decorator) => getAngularComponentDecoratorOptions(decorator, context))
    .filter(Boolean);
  if (componentDecorators.length === 0) return null;
  const [componentDecorator] = componentDecorators;
  return componentDecorator;
}

export function getAngularComponentDecoratorOptions(
  decorator: NodePath<Decorator>,
  context: AstTransformContext<TransformContext>,
): NodePath<ObjectExpression> | null {
  const expression = decorator.get('expression');
  if (!expression.isCallExpression()) return null;
  const callee = expression.get('callee');
  if (!callee.isExpression()) return null;
  const componentDecoratorImport = getNamedModuleImportExpression(
    callee,
    ANGULAR_PACKAGE_NAME,
    null,
    ANGULAR_COMPONENT_DECORATOR_IMPORT_NAME,
    context,
  );
  if (!componentDecoratorImport) return null;
  const decoratorArguments = expression.get('arguments');
  if (decoratorArguments.length === 0) return null;
  const [decoratorArgument] = decoratorArguments;
  if (!decoratorArgument.isObjectExpression()) return null;
  return decoratorArgument;
}

export function getAngularViewChildMetadata(
  property: NodePath<ClassProperty>,
  context: AstTransformContext<TransformContext>,
): NodePath<Expression> | null {
  const decorators = property.get('decorators');
  if (!decorators || !Array.isArray(decorators)) return null;
  const viewChildDecorators = decorators
    .map((decorator) => getAngularViewChildDecoratorOptions(decorator, context))
    .filter(Boolean);
  if (viewChildDecorators.length === 0) return null;
  const [componentDecorator] = viewChildDecorators;
  return componentDecorator;
}

function getAngularViewChildDecoratorOptions(
  decorator: NodePath<Decorator>,
  context: AstTransformContext<TransformContext>,
): NodePath<Expression> | null {
  const expression = decorator.get('expression');
  if (!expression.isCallExpression()) return null;
  const callee = expression.get('callee');
  if (!callee.isExpression()) return null;
  const viewChildDecoratorImport = getNamedModuleImportExpression(
    callee,
    ANGULAR_PACKAGE_NAME,
    null,
    ANGULAR_VIEW_CHILD_DECORATOR_IMPORT_NAME,
    context,
  );
  if (!viewChildDecoratorImport) return null;
  const viewChildArguments = expression.get('arguments');
  if (viewChildArguments.length === 0) return null;
  const [decoratorArgument] = viewChildArguments;
  if (!decoratorArgument.isExpression()) return null;
  return decoratorArgument;
}

export function getAngularTemplateRootElements(ast: TmplAST): Array<TmplAstElement> {
  return ast.templateNodes.flatMap((node) => {
    const visitor = new TemplateRootElementVisitor();
    node.visit(visitor);
    return visitor.results;
  });
}

export function findNamedAngularTemplateElements(
  ast: AngularTemplateNode<AngularAstNode>,
  elementName: string,
): Array<AngularTemplateNode<TmplAstElement>> {
  return findTemplateNodes(
    ast,
    (node): node is AngularTemplateNode<TmplAstElement> =>
      node.node.constructor.name === Angular.TmplAstElement.name &&
      (node.node as Angular.TmplAstElement).name === elementName,
  );
}

export function getAngularComponentDataFieldReferences(
  component: NodePath<Class>,
  fieldName: string,
): Array<NodePath<Property | MemberExpression | OptionalMemberExpression>> {
  return findNamedClassMemberAccessorExpressions(component, fieldName);
}

export function getAngularComponentPropertyReadExpression(ast: AST): Angular.PropertyRead | null {
  const visitor = new ComponentPropertyReadExpressionVisitor();
  ast.visit(visitor);
  if (visitor.results.length === 0) return null;
  const [result] = visitor.results;
  if (!isTypedAngularExpressionNode(Angular.ImplicitReceiver, result.receiver)) return null;
  return result;
}

export function isNamedAngularComponentMethodCallExpression(methodName: string, ast: AST): boolean {
  const visitor = new ComponentMethodCallExpressionNameVisitor(methodName);
  ast.visit(visitor);
  return visitor.results.some((handler) => handler.methodName === methodName);
}

export function createAngularBooleanLiteral(value: boolean): Angular.LiteralPrimitive {
  return new Angular.LiteralPrimitive(undefined!, undefined!, value);
}

export function invertAngularBooleanExpression(expression: Angular.AST): Angular.AST {
  const value = getAngularExpressionRoot(expression);
  const existingTruthinessValue = isTypedAngularExpressionNode(Angular.LiteralPrimitive, value)
    ? Boolean(value.value)
    : isTypedAngularExpressionNode(Angular.EmptyExpr, value)
      ? true
      : null;
  if (typeof existingTruthinessValue === 'boolean') {
    const invertedValue = !existingTruthinessValue;
    return createAngularBooleanLiteral(invertedValue);
  } else {
    return new Angular.PrefixNot(undefined!, undefined!, value);
  }
}

class ComponentMethodCallExpressionNameVisitor extends RecursiveAstVisitor {
  public results: Array<{ handler: Call; methodName: string }> = [];
  private rootNode: AST | null = null;
  public constructor(private methodName: string) {
    super();
  }
  public visit(ast: AST, context?: any): any {
    if (!this.rootNode) this.rootNode = ast;
    return ast.visit(this, context);
  }
  public visitASTWithSource(ast: ASTWithSource, context?: any): any {
    if (ast === this.rootNode) this.rootNode = null;
    return this.visit(ast.ast, context);
  }
  public visitCall(ast: Call, context: any): any {
    if (ast === this.rootNode) {
      const handlerReference = ast.receiver;
      const visitor = new ComponentPropertyReadExpressionVisitor();
      visitor.visit(handlerReference);
      this.results.push(
        ...visitor.results.map((accessor) => ({ handler: ast, methodName: accessor.name })),
      );
    }
    return super.visitCall(ast, context);
  }
}

class ComponentPropertyReadExpressionVisitor extends RecursiveAstVisitor {
  public results: Array<PropertyRead> = [];
  private rootNode: AST | null = null;
  public visit(ast: AST, context?: any): any {
    if (!this.rootNode) this.rootNode = ast;
    return ast.visit(this, context);
  }
  public visitASTWithSource(ast: ASTWithSource, context?: any): any {
    if (ast === this.rootNode) this.rootNode = null;
    return this.visit(ast.ast, context);
  }
  public visitPropertyRead(ast: PropertyRead, context: any) {
    if (ast === this.rootNode) {
      this.results.push(ast);
    }
    return super.visitPropertyRead(ast, context);
  }
}

class TemplateRootElementVisitor extends TmplAstRecursiveVisitor {
  public results: Array<TmplAstElement> = [];
  public visitElement(element: TmplAstElement): void {
    this.results.push(element);
    return; // Prevent further traversal within root elements
  }
}
