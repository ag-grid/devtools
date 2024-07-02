import { describe, expect, test } from 'vitest';

import * as ast from './ast';
import { generate } from './generate';
import { NodePath, getModuleRoot } from './parse';
import { generateUniqueScopeBinding, getAccessorExpressionPaths } from './scope';
import { AccessorKey, AccessorReference, type AccessorPath, type Types } from './types';
import { match, unreachable } from '@ag-grid-devtools/utils';
import { OptionalMemberExpression } from '@babel/types';

type Class = Types.Class;
type ClassBody = Types.ClassBody;
type ClassPrivateProperty = Types.ClassPrivateProperty;
type Expression = Types.Expression;
type MemberExpression = Types.MemberExpression;
type ObjectExpression = Types.ObjectExpression;
type PrivateName = Types.PrivateName;
type Property = Types.Property;
type Statement = Types.Statement;

describe(getAccessorExpressionPaths, () => {
  describe('const declarations', () => {
    test('simple references', () => {
      const input = ast.module`const foo = 3; foo;`;
      const program = getModuleRoot(input);
      const statements = program.get('body');
      const finalStatement: NodePath<Statement> = statements[statements.length - 1];
      finalStatement.assertExpressionStatement();
      const expression = finalStatement.get('expression');
      const actual = getAccessorExpressionPaths(expression);
      expect(actual && actual.map(formatAccessorPath)).toEqual(['3{foo}']);
    });

    describe('property accessors', () => {
      test('simple property accessors', () => {
        const input = ast.module`const foo = 3; foo.bar;`;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement: NodePath<Statement> = statements[statements.length - 1];
        finalStatement.assertExpressionStatement();
        const expression = finalStatement.get('expression');
        const actual = getAccessorExpressionPaths(expression);
        expect(actual && actual.map(formatAccessorPath)).toEqual(['3{foo}.bar']);
      });

      test('nested property accessors', () => {
        const input = ast.module`const foo = 3; foo.bar.baz.qux;`;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement: NodePath<Statement> = statements[statements.length - 1];
        finalStatement.assertExpressionStatement();
        const expression = finalStatement.get('expression');
        const actual = getAccessorExpressionPaths(expression);
        expect(actual && actual.map(formatAccessorPath)).toEqual(['3{foo}.bar.baz.qux']);
      });
    });

    describe('property destructuring', () => {
      test('nested property destructuring', () => {
        const input = ast.module`const foo = 3; const { bar } = foo; bar;`;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement: NodePath<Statement> = statements[statements.length - 1];
        finalStatement.assertExpressionStatement();
        const expression = finalStatement.get('expression');
        const actual = getAccessorExpressionPaths(expression);
        expect(actual && actual.map(formatAccessorPath)).toEqual(['3{foo}.bar{bar}']);
      });

      test('deeply nested property destructuring', () => {
        const input = ast.module`const foo = 3; const { bar: { baz } } = foo; baz;`;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement: NodePath<Statement> = statements[statements.length - 1];
        finalStatement.assertExpressionStatement();
        const expression = finalStatement.get('expression');
        const actual = getAccessorExpressionPaths(expression);
        expect(actual && actual.map(formatAccessorPath)).toEqual(['3{foo}.bar.baz{baz}']);
      });
    });

    describe('aliased variables', () => {
      describe('simple aliases', () => {
        test('nested aliases', () => {
          const input = ast.module`const foo = 3; const bar = foo; bar;`;
          const program = getModuleRoot(input);
          const statements = program.get('body');
          const finalStatement: NodePath<Statement> = statements[statements.length - 1];
          finalStatement.assertExpressionStatement();
          const expression = finalStatement.get('expression');
          const actual = getAccessorExpressionPaths(expression);
          expect(actual && actual.map(formatAccessorPath)).toEqual(['3{bar,foo}']);
        });

        test('deeply nested aliases', () => {
          const input = ast.module`const foo = 3; const bar = foo; const baz = bar; const qux = baz; qux;`;
          const program = getModuleRoot(input);
          const statements = program.get('body');
          const finalStatement: NodePath<Statement> = statements[statements.length - 1];
          finalStatement.assertExpressionStatement();
          const expression = finalStatement.get('expression');
          const actual = getAccessorExpressionPaths(expression);
          expect(actual && actual.map(formatAccessorPath)).toEqual(['3{qux,baz,bar,foo}']);
        });
      });

      describe('property accessor aliases', () => {
        test('nested property accessor aliases', () => {
          const input = ast.module`const foo = 3; const bar = foo.bar; bar;`;
          const program = getModuleRoot(input);
          const statements = program.get('body');
          const finalStatement: NodePath<Statement> = statements[statements.length - 1];
          finalStatement.assertExpressionStatement();
          const expression = finalStatement.get('expression');
          const actual = getAccessorExpressionPaths(expression);
          expect(actual && actual.map(formatAccessorPath)).toEqual(['3{foo}.bar{bar}']);
        });

        test('deeply nested property accessor aliases', () => {
          const input = ast.module`const foo = 3; const bar = foo.bar; const baz = bar.baz; const qux = baz.qux; qux;`;
          const program = getModuleRoot(input);
          const statements = program.get('body');
          const finalStatement: NodePath<Statement> = statements[statements.length - 1];
          finalStatement.assertExpressionStatement();
          const expression = finalStatement.get('expression');
          const actual = getAccessorExpressionPaths(expression);
          expect(actual && actual.map(formatAccessorPath)).toEqual([
            '3{foo}.bar{bar}.baz{baz}.qux{qux}',
          ]);
        });
      });
    });

    describe('class fields', () => {
      test('direct accessors', () => {
        const input = ast.module`
          class Foo {
            constructor() {
              this.foo = 3;
            }
            getFoo() {
              return this.foo;
            }
          }
        `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const classDeclaration: NodePath<Statement> = statements[0];
        classDeclaration.assertClassDeclaration();
        const classMembers = classDeclaration.get('body').get('body');
        const getterMethod: NodePath<ClassBody['body'][number]> =
          classMembers[classMembers.length - 1];
        getterMethod.assertClassMethod();
        const methodStatements = getterMethod.get('body').get('body');
        const returnStatement: NodePath<Statement> = methodStatements[methodStatements.length - 1];
        returnStatement.assertReturnStatement();
        const expression: NodePath<Expression | null | undefined> = returnStatement.get('argument');
        expression.assertExpression();
        const actual = getAccessorExpressionPaths(expression);
        expect(actual && actual.map(formatAccessorPath)).toEqual(['3{Foo.foo}']);
      });

      test('nested accessors', () => {
        const input = ast.module`
          class Foo {
            constructor() {
              this.foo = 3;
            }
            getFoo() {
              return this.foo.bar.baz;
            }
          }
        `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const classDeclaration: NodePath<Statement> = statements[0];
        classDeclaration.assertClassDeclaration();
        const classMembers = classDeclaration.get('body').get('body');
        const getterMethod: NodePath<ClassBody['body'][number]> =
          classMembers[classMembers.length - 1];
        getterMethod.assertClassMethod();
        const methodStatements = getterMethod.get('body').get('body');
        const returnStatement: NodePath<Statement> = methodStatements[methodStatements.length - 1];
        returnStatement.assertReturnStatement();
        const expression: NodePath<Expression | null | undefined> = returnStatement.get('argument');
        expression.assertExpression();
        const actual = getAccessorExpressionPaths(expression);
        expect(actual && actual.map(formatAccessorPath)).toEqual(['3{Foo.foo}.bar.baz']);
      });

      test('multiple initializers', () => {
        const input = ast.module`
          class Foo {
            foo = 3;
            constructor() {
              this.foo = 4;
            }
            setFoo(value) {
              this.foo = value;
            }
            getFoo() {
              return this.foo;
            }
          }
        `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const classDeclaration: NodePath<Statement> = statements[0];
        classDeclaration.assertClassDeclaration();
        const classMembers = classDeclaration.get('body').get('body');
        const getterMethod: NodePath<ClassBody['body'][number]> =
          classMembers[classMembers.length - 1];
        getterMethod.assertClassMethod();
        const methodStatements = getterMethod.get('body').get('body');
        const returnStatement: NodePath<Statement> = methodStatements[methodStatements.length - 1];
        returnStatement.assertReturnStatement();
        const expression: NodePath<Expression | null | undefined> = returnStatement.get('argument');
        expression.assertExpression();
        const actual = getAccessorExpressionPaths(expression);
        expect(actual && actual.map(formatAccessorPath)).toEqual([
          '3{Foo.foo}',
          '4{Foo.foo}',
          'value{Foo.foo,value}',
        ]);
      });
    });

    describe('object prototype fields', () => {
      test('direct accessors', () => {
        const input = ast.module`
          const Foo = {
            foo: 3,
            getFoo() {
              return this.foo;
            },
          };
        `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const variableDeclaration: NodePath<Statement> = statements[0];
        variableDeclaration.assertVariableDeclaration();
        const objectDeclaration: NodePath<Expression | null | undefined> = variableDeclaration
          .get('declarations')[0]
          .get('init');
        objectDeclaration.assertObjectExpression();
        const classMembers = objectDeclaration.get('properties');
        const getterMethod: NodePath<ObjectExpression['properties'][number]> =
          classMembers[classMembers.length - 1];
        getterMethod.assertObjectMethod();
        const methodStatements = getterMethod.get('body').get('body');
        const returnStatement: NodePath<Statement> = methodStatements[methodStatements.length - 1];
        returnStatement.assertReturnStatement();
        const expression: NodePath<Expression | null | undefined> = returnStatement.get('argument');
        expression.assertExpression();
        const actual = getAccessorExpressionPaths(expression);
        expect(actual && actual.map(formatAccessorPath)).toEqual(['3{{}.foo}']);
      });

      test('nested accessors', () => {
        const input = ast.module`
          const Foo = {
            foo: 3,
            getFoo() {
              return this.foo.bar.baz;
            },
          };
        `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const variableDeclaration: NodePath<Statement> = statements[0];
        variableDeclaration.assertVariableDeclaration();
        const objectDeclaration: NodePath<Expression | null | undefined> = variableDeclaration
          .get('declarations')[0]
          .get('init');
        objectDeclaration.assertObjectExpression();
        const classMembers = objectDeclaration.get('properties');
        const getterMethod: NodePath<ObjectExpression['properties'][number]> =
          classMembers[classMembers.length - 1];
        getterMethod.assertObjectMethod();
        const methodStatements = getterMethod.get('body').get('body');
        const returnStatement: NodePath<Statement> = methodStatements[methodStatements.length - 1];
        returnStatement.assertReturnStatement();
        const expression: NodePath<Expression | null | undefined> = returnStatement.get('argument');
        expression.assertExpression();
        const actual = getAccessorExpressionPaths(expression);
        expect(actual && actual.map(formatAccessorPath)).toEqual(['3{{}.foo}.bar.baz']);
      });

      test('multiple initializers', () => {
        const input = ast.module`
          const Foo = {
            foo: 3,
            init() {
              this.foo = 4;
            },
            setFoo(value) {
              this.foo = value;
            },
            getFoo() {
              return this.foo;
            },
          };
        `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const variableDeclaration: NodePath<Statement> = statements[0];
        variableDeclaration.assertVariableDeclaration();
        const objectDeclaration: NodePath<Expression | null | undefined> = variableDeclaration
          .get('declarations')[0]
          .get('init');
        objectDeclaration.assertObjectExpression();
        const classMembers = objectDeclaration.get('properties');
        const getterMethod: NodePath<ObjectExpression['properties'][number]> =
          classMembers[classMembers.length - 1];
        getterMethod.assertObjectMethod();
        const methodStatements = getterMethod.get('body').get('body');
        const returnStatement: NodePath<Statement> = methodStatements[methodStatements.length - 1];
        returnStatement.assertReturnStatement();
        const expression: NodePath<Expression | null | undefined> = returnStatement.get('argument');
        expression.assertExpression();
        const actual = getAccessorExpressionPaths(expression);
        expect(actual && actual.map(formatAccessorPath)).toEqual([
          '3{{}.foo}',
          '4{{}.foo}',
          'value{{}.foo,value}',
        ]);
      });
    });
  });
});

function formatAccessorPath(accessor: AccessorPath): string {
  const {
    root: { target, references },
    path,
  } = accessor;
  return [
    generate(target.node),
    ...(references.length > 0 ? [formatReferences(references)] : []),
    ...path.flatMap(({ key, references }) => {
      const formattedKey = formatValueAccessorKey(key);
      if (references.length === 0) return [formattedKey];
      return [formattedKey, formatReferences(references)];
    }),
  ].join('');
}

function formatValueAccessorKey(key: AccessorKey): string {
  return match(key, {
    Property: ({ name }) => `.${name}`,
    PrivateField: ({ name }) => `.#${name}`,
    Index: ({ index }) => `[${index}]`,
    ObjectRest: ({}) => `[...]`,
    ArrayRest: ({}) => `[...]`,
    Computed: ({ expression }) => `[${generate(expression.node)}]`,
  });
}

function formatReferences(references: Array<AccessorReference>): string {
  return `{${references.map(formatReference).join(',')}}`;
}

function formatReference(reference: AccessorReference): string {
  return match(reference, {
    Local: ({ binding }) => binding.identifier.name,
    Property: ({ target, accessor }) =>
      `${formatPropertyAccessorClassName(target)}${formatPropertyAccessorFieldName(accessor)}`,
  });
}

function formatPropertyAccessorClassName(target: NodePath<Class | ObjectExpression>): string {
  return target.isClass() && target.node.id ? target.node.id.name : '{}';
}

function formatPropertyAccessorFieldName(
  accessor: NodePath<Property | MemberExpression | OptionalMemberExpression>,
): string {
  if (accessor.isProperty()) {
    const key = accessor.get('key');
    const computed = isPublicProperty(accessor) ? accessor.node.computed : false;
    return formatPropertyAccessorKey(key, computed);
  }
  if (accessor.isMemberExpression()) {
    return formatPropertyAccessorKey(accessor.get('property'), accessor.node.computed);
  }
  if (accessor.isOptionalMemberExpression()) {
    return formatPropertyAccessorKey(accessor.get('property'), accessor.node.computed);
  }
  return '[]';
}

function formatPropertyAccessorKey(
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): string {
  if (key.isPrivateName()) {
    return `.#${key.node.id.name}`;
  } else {
    if (!computed && key.isIdentifier()) return `.${key.node.name}`;
    return `[${generate(key.node)}]`;
  }
}

function isPublicProperty(
  property: NodePath<Property>,
): property is NodePath<Exclude<Property, ClassPrivateProperty>> {
  if (property.isClassPrivateProperty()) return false;
  return true;
}

function formatLiteral(fieldName: NodePath<Types.Literal>): string {
  if (fieldName.isStringLiteral()) return JSON.stringify(fieldName.node.value);
  if (fieldName.isNumericLiteral()) return String(fieldName.node.value);
  if (fieldName.isNullLiteral()) return String(null);
  if (fieldName.isBooleanLiteral()) return String(fieldName.node.value);
  if (fieldName.isRegExpLiteral()) return '..';
  if (fieldName.isTemplateLiteral()) return '..';
  if (fieldName.isBigIntLiteral()) return String(fieldName.node.value);
  if (fieldName.isDecimalLiteral()) return String(fieldName.node.value);
  return '..';
}
