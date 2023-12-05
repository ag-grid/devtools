import {
  findNamedClassMemberAccessorExpressions,
  getNamedModuleImportExpression,
  node as t,
  type AstTransformContext,
  type FsContext,
  type FileMetadata,
  type NodePath,
  type Types,
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
  printTemplate,
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

export type AngularAstNode = TmplAST | TmplAstNode;

export interface TmplAST extends TSESTree.Program {
  templateNodes: Array<TmplAstNode>;
}

type Class = Types.Class;
type ClassProperty = Types.ClassProperty;
type Decorator = Types.Decorator;
type Expression = Types.Expression;
type MemberExpression = Types.MemberExpression;
type ObjectExpression = Types.ObjectExpression;
type ObjectProperty = Types.ObjectProperty;
type Property = Types.Property;
type TemplateLiteral = Types.TemplateLiteral;

const ANGULAR_PACKAGE_NAME = '@angular/core';
const ANGULAR_COMPONENT_DECORATOR_IMPORT_NAME = 'Component';
const ANGULAR_COMPONENT_METADATA_TEMPLATE_FIELD_NAME = 'template';
const ANGULAR_COMPONENT_METADATA_TEMPLATE_URL_FIELD_NAME = 'templateUrl';
const ANGULAR_VIEW_CHILD_DECORATOR_IMPORT_NAME = 'ViewChild';

export interface AngularNodeType<T extends TmplAstNode = TmplAstNode> {
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
  const componentMetadata = getAngularComponentMetadata(component);
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
  nodeType: AngularNodeType<T>,
  node: AngularAstNode,
): node is T {
  return !isAngularAstRootNode(node) && node.constructor.name === (nodeType as Function).name;
}

export function isTypedAngularTemplateNode<T extends TmplAstNode>(
  nodeType: AngularNodeType<T>,
  templateNode: AngularTemplateNode<AngularAstNode>,
): templateNode is AngularTemplateNode<T> {
  const { node } = templateNode;
  return isTypedAngularAstNode(nodeType, node);
}

function printAngularNode(
  node: AngularAstNode,
  previous: AngularAstNode | null,
  templateSource: string,
): string {
  switch (node.constructor.name) {
    // FIXME: format all Angular element attribute node types
    case Angular.TmplAstBoundAttribute.name:
      if (!previous || previous.constructor.name !== node.constructor.name) break;
      const previousNode = previous as Angular.TmplAstBoundAttribute;
      const updatedNode = node as Angular.TmplAstBoundAttribute;
      const isKeyUpdate =
        updatedNode.name !== previousNode.name &&
        updatedNode.type === previousNode.type &&
        updatedNode.securityContext === previousNode.securityContext &&
        updatedNode.value === previousNode.value &&
        updatedNode.unit === previousNode.unit &&
        updatedNode.i18n === previousNode.i18n;
      if (!isKeyUpdate) break;
      const prefix = templateSource.slice(
        previousNode.sourceSpan.start.offset,
        previousNode.keySpan.start.offset,
      );
      const suffix = templateSource.slice(
        previousNode.keySpan.end.offset,
        previousNode.sourceSpan.end.offset,
      );
      return `${prefix}${updatedNode.name}${suffix}`;
    default:
      // FIXME: format all Angular AST node types
      break;
  }
  throw new Error(`Unable to format node type: ${node.constructor.name}`);
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
): NodePath<ObjectExpression> | null {
  const decorators = component.get('decorators');
  if (!decorators || !Array.isArray(decorators)) return null;
  const componentDecorators = decorators
    .map((decorator) => getAngularComponentDecoratorOptions(decorator))
    .filter(Boolean);
  if (componentDecorators.length === 0) return null;
  const [componentDecorator] = componentDecorators;
  return componentDecorator;
}

export function getAngularComponentDecoratorOptions(
  decorator: NodePath<Decorator>,
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
): NodePath<Expression> | null {
  const decorators = property.get('decorators');
  if (!decorators || !Array.isArray(decorators)) return null;
  const viewChildDecorators = decorators
    .map((decorator) => getAngularViewChildDecoratorOptions(decorator))
    .filter(Boolean);
  if (viewChildDecorators.length === 0) return null;
  const [componentDecorator] = viewChildDecorators;
  return componentDecorator;
}

function getAngularViewChildDecoratorOptions(
  decorator: NodePath<Decorator>,
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
    const visitor = new RootElementVisitor();
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
): Array<NodePath<Property | MemberExpression>> {
  return findNamedClassMemberAccessorExpressions(component, fieldName);
}

export function getAngularPropertyReadExpressionName(ast: AST): string | null {
  const visitor = new PropertyReadExpressionNameVisitor();
  ast.visit(visitor);
  if (visitor.results.length === 0) return null;
  const [result] = visitor.results;
  return result;
}

export function isNamedAngularMethodCallExpression(methodName: string, ast: AST): boolean {
  const visitor = new MethodCallExpressionNameVisitor(methodName);
  ast.visit(visitor);
  return visitor.results.some((handler) => handler.methodName === methodName);
}

class RootElementVisitor extends TmplAstRecursiveVisitor {
  public results: Array<TmplAstElement> = [];
  public visitElement(element: TmplAstElement): void {
    this.results.push(element);
    return; // Prevent further traversal within root elements
  }
}

class NamedElementVisitor extends TmplAstRecursiveVisitor {
  public results: Array<TmplAstElement> = [];
  public constructor(private elementName: string) {
    super();
  }
  public visitElement(element: TmplAstElement): void {
    if (element.name === this.elementName) this.results.push(element);
    return super.visitElement(element);
  }
}

class MethodCallExpressionNameVisitor extends RecursiveAstVisitor {
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
      const visitor = new PropertyReadExpressionNameVisitor();
      visitor.visit(handlerReference);
      this.results.push(...visitor.results.map((methodName) => ({ handler: ast, methodName })));
    }
    return super.visitCall(ast, context);
  }
}

class PropertyReadExpressionNameVisitor extends RecursiveAstVisitor {
  public results: Array<string> = [];
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
      this.results.push(ast.name);
    }
    return super.visitPropertyRead(ast, context);
  }
}
