import { describe, expect, test } from 'vitest';

import * as ast from './ast';
import { generate } from './generate';
import { node as t } from './node';
import { NodePath, getModuleRoot } from './parse';
import {
  generateUniqueScopeBinding,
  getAccessorExpressionPaths,
  getExpressionReferences,
} from './scope';
import { AccessorKey, AccessorReference, type AccessorPath, type Types } from './types';
import { match, unreachable } from '@ag-grid-devtools/utils';
import { findAstNode } from './traverse';

type Class = Types.Class;
type ClassBody = Types.ClassBody;
type ClassPrivateProperty = Types.ClassPrivateProperty;
type Expression = Types.Expression;
type MemberExpression = Types.MemberExpression;
type ObjectExpression = Types.ObjectExpression;
type PrivateName = Types.PrivateName;
type Property = Types.Property;
type Statement = Types.Statement;

describe.only(getExpressionReferences, () => {
  test('no references', () => {
    const expression = t.numericLiteral(3);
    const input = ast.module`
      'pre';
      ${expression};
      'post';
    `;
    const target = findAstNode(
      input,
      (path): path is NodePath<Expression> => path.node === expression,
    )!;
    const actual = getExpressionReferences(target);
    expect(actual).toEqual([]);
  });

  describe('variable declaration', () => {
    test('no references', () => {
      const expression = t.numericLiteral(3);
      const identifier = t.identifier('foo');
      const input = ast.module`
        'pre';
        const ${identifier} = ${expression};
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === expression,
      )!;
      const actual = getExpressionReferences(target);
      expect(actual && actual.map(({ node }) => node)).toEqual([identifier]);
      expect(actual && actual[0].node).toBe(identifier);
    });

    test('single reference', () => {
      const expression = t.numericLiteral(3);
      const identifier = t.identifier('foo');
      const usage = t.identifier(identifier.name);
      const input = ast.module`
        'pre';
        const ${identifier} = ${expression};
        ${usage};
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === expression,
      )!;
      const actual = getExpressionReferences(target);
      expect(actual && actual.map(({ node }) => node)).toEqual([identifier, usage]);
      expect(actual && actual[0].node).toBe(identifier);
      expect(actual && actual[1].node).toBe(usage);
    });

    test('multiple references', () => {
      const expression = t.numericLiteral(3);
      const identifier = t.identifier('foo');
      const usage1 = t.identifier(identifier.name);
      const usage2 = t.identifier(identifier.name);
      const input = ast.module`
        'pre';
        const ${identifier} = ${expression};
        ${usage1};
        ${usage2};
        'post'
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === expression,
      )!;
      const actual = getExpressionReferences(target);
      expect(actual && actual.map(({ node }) => node)).toEqual([identifier, usage1, usage2]);
      expect(actual && actual[0].node).toBe(identifier);
      expect(actual && actual[1].node).toBe(usage1);
      expect(actual && actual[2].node).toBe(usage2);
    });

    test('object destructuring', () => {
      const expression = ast.expression`({ foo: 3, bar: 4, baz: 5 })`;
      const pattern = t.objectPattern([
        t.objectProperty(t.identifier('foo'), t.identifier('foo')),
        t.objectProperty(
          t.identifier('bar'),
          t.assignmentExpression('=', t.identifier('second'), t.numericLiteral(4)),
        ),
        t.restElement(t.identifier('qux')),
      ]);
      const input = ast.module`
        'pre';
        const ${pattern} = ${expression};
        foo;
        second;
        qux;
        'post'
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === expression,
      )!;
      const actual = getExpressionReferences(target);
      expect(actual && actual.map(({ node }) => node)).toEqual([pattern]);
      expect(actual && actual[0].node).toBe(pattern);
    });
  });

  describe('variable assignment', () => {
    test.only('no references', () => {
      const expression = t.numericLiteral(3);
      const declaration = t.identifier('foo');
      const assignment = t.identifier(declaration.name);
      const input = ast.module`
        'pre';
        let ${declaration};
        ${assignment} = ${expression};
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === expression,
      )!;
      const actual = getExpressionReferences(target);
      expect(actual && actual.map(({ node }) => node)).toEqual([assignment, declaration]);
      expect(actual && actual[0].node).toBe(assignment);
      expect(actual && actual[1].node).toBe(declaration);
    });

    test('single reference', () => {
      const expression = t.numericLiteral(3);
      const declaration = t.identifier('foo');
      const assignment = t.identifier(declaration.name);
      const usage = t.identifier(declaration.name);
      const input = ast.module`
        'pre';
        let ${declaration}
        ${assignment} = ${expression};
        ${usage};
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === expression,
      )!;
      const actual = getExpressionReferences(target);
      expect(actual && actual.map(({ node }) => node)).toEqual([assignment, declaration, usage]);
      expect(actual && actual[0].node).toBe(assignment);
      expect(actual && actual[1].node).toBe(declaration);
      expect(actual && actual[2].node).toBe(usage);
    });

    test('multiple references', () => {
      const expression = t.numericLiteral(3);
      const declaration = t.identifier('foo');
      const assignment = t.identifier(declaration.name);
      const usage1 = t.identifier(declaration.name);
      const usage2 = t.identifier(declaration.name);
      const input = ast.module`
        'pre';
        let ${declaration};
        ${assignment} = ${expression};
        ${usage1};
        ${usage2};
        'post'
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === expression,
      )!;
      const actual = getExpressionReferences(target);
      expect(actual && actual.map(({ node }) => node)).toEqual([
        assignment,
        declaration,
        usage1,
        usage2,
      ]);
      expect(actual && actual[0].node).toBe(assignment);
      expect(actual && actual[1].node).toBe(declaration);
      expect(actual && actual[2].node).toBe(usage1);
      expect(actual && actual[3].node).toBe(usage2);
    });

    test('object destructuring', () => {
      const identifier = t.identifier('foo');
      const key = t.identifier('bar');
      const expression = ast.expression`({ foo: 3, bar: 4, baz: 5 })`;
      const property = ast.expression`${identifier}.${key}`;
      const accessor = ast.expression`${identifier}.${key}`;
      const input = ast.module`
        'pre';
        const ${identifier} = { ${key}: null };
        ${property} = ${expression};
        ${accessor};
        'post'
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === expression,
      )!;
      const actual = getExpressionReferences(target);
      expect(actual && actual.map(({ node }) => node)).toEqual([property]);
      expect(actual && actual[0].node).toBe(property);
    });
  });
});

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

function formatPropertyAccessorFieldName(accessor: NodePath<Property | MemberExpression>): string {
  if (accessor.isProperty()) {
    const key = accessor.get('key');
    const computed = isPublicProperty(accessor) ? accessor.node.computed : false;
    return formatPropertyAccessorKey(key, computed);
  }
  if (accessor.isMemberExpression()) {
    const key = accessor.get('property');
    return formatPropertyAccessorKey(key, accessor.node.computed);
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
