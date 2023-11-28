import {
  getNamedModuleImportExpression,
  type FileMetadata,
  type NodePath,
  type Types,
} from '@ag-grid-devtools/ast';
import {
  RecursiveAstVisitor,
  TmplAstRecursiveVisitor,
  type AST,
  type ASTWithSource,
  type Call,
  type PropertyRead,
  type TmplAstElement,
  type TmplAstNode,
} from '@angular/compiler';
import { parse } from '@angular-eslint/template-parser';
import fs from 'node:fs';
import path from 'node:path';

type Class = Types.Class;
type ClassProperty = Types.ClassProperty;
type Decorator = Types.Decorator;
type Expression = Types.Expression;
type ObjectExpression = Types.ObjectExpression;
type ObjectProperty = Types.ObjectProperty;
type TemplateLiteral = Types.TemplateLiteral;

export interface TmplAST extends ReturnType<typeof parse> {
  templateNodes: Array<TmplAstNode>;
}

export interface AngularComponentTemplate {
  templateUrl: string | null;
  source: string;
  ast: TmplAST;
}

const ANGULAR_PACKAGE_NAME = '@angular/core';
const ANGULAR_COMPONENT_DECORATOR_IMPORT_NAME = 'Component';
const ANGULAR_COMPONENT_METADATA_TEMPLATE_FIELD_NAME = 'template';
const ANGULAR_COMPONENT_METADATA_TEMPLATE_URL_FIELD_NAME = 'templateUrl';
const ANGULAR_VIEW_CHILD_DECORATOR_IMPORT_NAME = 'ViewChild';

export function parseAngularComponentTemplate(
  component: NodePath<Class>,
  context: FileMetadata,
): AngularComponentTemplate | null {
  const { filename } = context;
  const componentMetadata = getAngularComponentMetadata(component);
  if (!componentMetadata) return null;
  const template = getAngularComponentMetadataTemplateSource(componentMetadata, context);
  if (!template || !template.source) return null;
  const ast = parse(template.source, {
    filePath: filename || 'component.html',
    suppressParseErrors: false,
  });
  return {
    templateUrl: template.templateUrl,
    source: template.source,
    ast,
  };
}

function getAngularComponentMetadataTemplateSource(
  metadata: NodePath<ObjectExpression>,
  context: FileMetadata,
): { templateUrl: string | null; source: string | null } | null {
  const templateValue = getAngularComponentMetadataNamedFieldValue(
    metadata,
    ANGULAR_COMPONENT_METADATA_TEMPLATE_FIELD_NAME,
  );
  if (templateValue) {
    const templateSource = getStringExpressionValue(templateValue);
    return { templateUrl: null, source: templateSource };
  }
  const templateUrlValue = getAngularComponentMetadataNamedFieldValue(
    metadata,
    ANGULAR_COMPONENT_METADATA_TEMPLATE_URL_FIELD_NAME,
  );
  if (templateUrlValue) {
    const templateUrl = getStringExpressionValue(templateUrlValue);
    // FIXME: confirm assumptions on what constitutes a valid Angular templateUrl
    // FIXME: warn when unable to load Angular component template
    if (!templateUrl || !templateUrl.startsWith('.')) return null;
    const currentPath = context.filename ? path.dirname(context.filename) : '.';
    const templatePath = path.join(currentPath, templateUrl);
    const templateSource = (() => {
      try {
        return fs.readFileSync(templatePath, 'utf-8');
      } catch (error) {
        throw new Error(
          [
            `Failed to load Angular component template: ${templatePath}`,
            ...(context.filename ? [`  in component ${context.filename}`] : []),
          ].join('\n'),
          {
            cause: error,
          },
        );
      }
    })();
    return { templateUrl, source: templateSource };
  }
  // FIXME: warn when unable to parse Angular component template
  return null;
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

class RootElementVisitor extends TmplAstRecursiveVisitor {
  public results: Array<TmplAstElement> = [];
  public visitElement(element: TmplAstElement): void {
    this.results.push(element);
  }
}

export function findNamedAngularTemplateElements(
  ast: TmplAST,
  elementName: string,
): Array<TmplAstElement> {
  return ast.templateNodes.flatMap((node) => {
    const visitor = new NamedElementVisitor(elementName);
    node.visit(visitor);
    return visitor.results;
  });
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

export function isNamedMethodCallExpression(methodName: string, ast: AST): boolean {
  const visitor = new NamedMethodCallMatcherExpressionVisitor(methodName);
  ast.visit(visitor);
  return visitor.results.length > 0;
}

class NamedMethodCallMatcherExpressionVisitor extends RecursiveAstVisitor {
  public results: Array<Call> = [];
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
      const visitor = new NamedMethodAccessorMatcherExpressionVisitor(this.methodName);
      visitor.visit(ast.receiver);
      if (visitor.results.length > 0) {
        this.results.push(ast);
      }
    }
    return super.visitCall(ast, context);
  }
}

class NamedMethodAccessorMatcherExpressionVisitor extends RecursiveAstVisitor {
  public results: Array<PropertyRead> = [];
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
  public visitPropertyRead(ast: PropertyRead, context: any): any {
    if (ast === this.rootNode) {
      if (ast.name === this.methodName) this.results.push(ast);
    }
    return super.visitPropertyRead(ast, context);
  }
}
