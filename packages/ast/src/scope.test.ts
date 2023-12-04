import { describe, expect, test } from 'vitest';

import * as ast from './ast';
import { generate } from './generate';
import { node as t } from './node';
import { NodePath, getModuleRoot } from './parse';
import {
  Reference,
  getAccessorExpressionPaths,
  isReferenceNode,
  findReferences,
  getObjectPropertyReferences,
} from './scope';
import {
  AccessorKey,
  AccessorReference,
  type AccessorPath,
  type Types,
  type AstNode,
} from './types';
import { EnumDiscriminant, VARIANT, match } from '@ag-grid-devtools/utils';
import { findAstNode } from './traverse';

type Class = Types.Class;
type ClassBody = Types.ClassBody;
type ClassPrivateProperty = Types.ClassPrivateProperty;
type Expression = Types.Expression;
type FunctionDeclaration = Types.FunctionDeclaration;
type MemberExpression = Types.MemberExpression;
type ObjectExpression = Types.ObjectExpression;
type ObjectProperty = Types.ObjectProperty;
type PrivateName = Types.PrivateName;
type Property = Types.Property;
type Statement = Types.Statement;

describe(findReferences, () => {
  describe('variable declaration initializer values', () => {
    test('no references', () => {
      const identifier = t.identifier('foo');
      const input = ast.module`
        'pre';
        const ${identifier} = 3;
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === identifier,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [{ type: 'BindingDeclaration', node: identifier }];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('single reference', () => {
      const identifier = t.identifier('foo');
      const usage = t.identifier(identifier.name);
      const input = ast.module`
        'pre';
        const ${identifier} = 3;
        ${usage};
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === identifier,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'BindingDeclaration', node: identifier },
        { type: 'VariableGetter', node: usage },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('multiple references', () => {
      const identifier = t.identifier('foo');
      const usage1 = t.identifier(identifier.name);
      const usage2 = t.identifier(identifier.name);
      const input = ast.module`
        'pre';
        const ${identifier} = 3;
        ${usage1};
        ${usage2};
        'post'
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === identifier,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'BindingDeclaration', node: identifier },
        { type: 'VariableGetter', node: usage1 },
        { type: 'VariableGetter', node: usage2 },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('reassignment', () => {
      const identifier = t.identifier('foo');
      const reassignment = t.identifier(identifier.name);
      const input = ast.module`
        'pre';
        let ${identifier} = 3;
        ${reassignment} = 4;
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === identifier,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'BindingDeclaration', node: identifier },
        { type: 'VariableSetter', node: reassignment },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('object destructuring', () => {
      const key1 = t.identifier('foo');
      const key2 = t.identifier('bar');
      const identifier1 = t.identifier('foo');
      const identifier2 = t.identifier('qux');
      const restIdentifier = t.identifier('rest');
      const usage1 = t.identifier(identifier1.name);
      const usage2 = t.identifier(identifier2.name);
      const restUsage = t.identifier(restIdentifier.name);
      const pattern = t.objectPattern([
        t.objectProperty(key1, identifier1),
        t.objectProperty(key2, t.assignmentPattern(identifier2, t.numericLiteral(4))),
        t.restElement(restIdentifier),
      ]);
      const input = ast.module`
        'pre';
        const ${pattern} = { foo: 3, bar: 4, baz: 5 };
        ${usage1};
        ${usage2};
        ${restUsage};
        'post'
      `;
      {
        const target = findAstNode(
          input,
          (path): path is NodePath<Expression> => path.node === usage1,
        )!;
        const actual = isReferenceNode(target) ? findReferences(target) : [];
        const expected: ReferenceValues = [
          { type: 'BindingDeclaration', node: identifier1 },
          { type: 'VariableGetter', node: usage1 },
        ];
        expect(stripReferencePaths(actual)).toEqual(expected);
        for (const [actualRef, expectedRef] of zip(actual, expected)) {
          expect(actualRef.path.node).toBe(expectedRef.node);
        }
      }
      {
        const target = findAstNode(
          input,
          (path): path is NodePath<Expression> => path.node === usage2,
        )!;
        const actual = isReferenceNode(target) ? findReferences(target) : [];
        const expected: ReferenceValues = [
          { type: 'BindingDeclaration', node: identifier2 },
          { type: 'VariableGetter', node: usage2 },
        ];
        expect(stripReferencePaths(actual)).toEqual(expected);
        for (const [actualRef, expectedRef] of zip(actual, expected)) {
          expect(actualRef.path.node).toBe(expectedRef.node);
        }
      }
      {
        const target = findAstNode(
          input,
          (path): path is NodePath<Expression> => path.node === restUsage,
        )!;
        const actual = isReferenceNode(target) ? findReferences(target) : [];
        const expected: ReferenceValues = [
          { type: 'BindingDeclaration', node: restIdentifier },
          { type: 'VariableGetter', node: restUsage },
        ];
        expect(stripReferencePaths(actual)).toEqual(expected);
        for (const [actualRef, expectedRef] of zip(actual, expected)) {
          expect(actualRef.path.node).toBe(expectedRef.node);
        }
      }
    });
  });

  describe('variable assigned values', () => {
    test('no references', () => {
      const identifier = t.identifier('foo');
      const assignment = t.identifier(identifier.name);
      const input = ast.module`
        'pre';
        let ${identifier};
        ${assignment} = 3;
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === identifier,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'BindingDeclaration', node: identifier },
        { type: 'VariableSetter', node: assignment },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('single reference', () => {
      const identifier = t.identifier('foo');
      const assignment = t.identifier(identifier.name);
      const usage = t.identifier(identifier.name);
      const input = ast.module`
        'pre';
        let ${identifier}
        ${assignment} = 3;
        ${usage};
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === identifier,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'BindingDeclaration', node: identifier },
        { type: 'VariableSetter', node: assignment },
        { type: 'VariableGetter', node: usage },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('reassignment', () => {
      const identifier = t.identifier('foo');
      const assignment = t.identifier(identifier.name);
      const reassignment = t.identifier(identifier.name);
      const input = ast.module`
        'pre';
        let ${identifier}
        ${assignment} = 3;
        ${reassignment} = 4;
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === identifier,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'BindingDeclaration', node: identifier },
        { type: 'VariableSetter', node: assignment },
        { type: 'VariableSetter', node: reassignment },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('multiple references', () => {
      const identifier = t.identifier('foo');
      const assignment = t.identifier(identifier.name);
      const usage1 = t.identifier(identifier.name);
      const usage2 = t.identifier(identifier.name);
      const input = ast.module`
        'pre';
        let ${identifier};
        ${assignment} = 3;
        ${usage1};
        ${usage2};
        'post'
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === identifier,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'BindingDeclaration', node: identifier },
        { type: 'VariableSetter', node: assignment },
        { type: 'VariableGetter', node: usage1 },
        { type: 'VariableGetter', node: usage2 },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('nested property assignment', () => {
      const initializer = t.identifier('foo');
      const accessor = ast.expression`foo.bar`;
      const usage = ast.expression`foo.bar`;
      const input = ast.module`
        'pre';
        const ${initializer} = { bar: null };
        ${accessor} = 3;
        ${usage};
        'post'
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === accessor,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'PropertySetter', node: accessor },
        { type: 'PropertyGetter', node: usage },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });
  });

  describe('object property assigned values', () => {
    test('no references', () => {
      const initializer = t.identifier('foo');
      const assignment = ast.expression`foo.bar`;
      const input = ast.module`
        'pre';
        const ${initializer} = { bar: null };
        ${assignment} = 3;
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === assignment,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [{ type: 'PropertySetter', node: assignment }];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('single reference', () => {
      const initializer = t.identifier('foo');
      const assignment = ast.expression`foo.bar`;
      const accessor = ast.expression`foo.bar`;
      const input = ast.module`
        'pre';
        const ${initializer} = { bar: null };
        ${assignment} = 3;
        ${accessor}.baz;
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === assignment,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'PropertySetter', node: assignment },
        { type: 'PropertyGetter', node: accessor },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('multiple references', () => {
      const initializer = t.identifier('foo');
      const assignment = ast.expression`foo.bar`;
      const accessor1 = ast.expression`foo.bar`;
      const accessor2 = ast.expression`foo.bar`;
      const input = ast.module`
        'pre';
        ${accessor1}.baz;
        const ${initializer} = { bar: null };
        ${assignment} = 3;
        ${accessor2}.baz;
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === assignment,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'PropertyGetter', node: accessor1 },
        { type: 'PropertySetter', node: assignment },
        { type: 'PropertyGetter', node: accessor2 },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('destructured references', () => {
      const initializer = t.identifier('foo');
      const assignment = ast.expression`foo.bar`;
      const accessor1 = t.identifier('bar');
      const accessor2 = t.identifier('bar');
      const input = ast.module`
        'pre';
        const ${initializer} = { baz: null };
        ${assignment} = 3;
        const { ${accessor1} } = foo;
        ${accessor2}.baz;
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === assignment,
      )!;
      const shorthandPropertyAccessor = findAstNode(
        input,
        (path): path is NodePath<ObjectProperty> =>
          path.isObjectProperty() &&
          path.node.shorthand &&
          path.node.key === accessor1 &&
          t.isIdentifier(path.node.value) &&
          path.node.value.name === accessor1.name,
      )!.node.value;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'PropertySetter', node: assignment },
        { type: 'BindingDeclaration', node: shorthandPropertyAccessor },
        { type: 'VariableGetter', node: accessor2 },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('aliased destructured references', () => {
      const initializer = t.identifier('foo');
      const assignment = ast.expression`foo.bar`;
      const accessor1 = t.identifier('bar');
      const accessor2 = t.identifier('bar');
      const input = ast.module`
        'pre';
        const ${initializer} = { bar: null };
        ${assignment} = 3;
        const { bar: ${accessor1} } = foo;
        ${accessor2}.baz;
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === assignment,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'PropertySetter', node: assignment },
        { type: 'BindingDeclaration', node: accessor1 },
        { type: 'VariableGetter', node: accessor2 },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });
  });

  describe('references to destructuring patterns', () => {
    test('shallow destructuring references', () => {
      const accessor1 = t.identifier('bar');
      const accessor2 = t.identifier('bar');
      const input = ast.module`
        'pre';
        const foo = { bar: { baz: 3 } };
        const { bar: ${accessor1} } = foo;
        ${accessor2}.baz;
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === accessor2,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'BindingDeclaration', node: accessor1 },
        { type: 'VariableGetter', node: accessor2 },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });

    test('deep destructuring references', () => {
      const accessor1 = t.identifier('baz');
      const accessor2 = t.identifier('baz');
      const input = ast.module`
        'pre';
        const foo = { bar: { baz: { qux: 3 } } };
        const { bar: { baz: ${accessor1} } } = foo;
        ${accessor2}.qux;
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === accessor2,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'BindingDeclaration', node: accessor1 },
        { type: 'VariableGetter', node: accessor2 },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });
  });

  describe('references to function declarations', () => {
    test('hoisted function declarations', () => {
      const accessor = t.identifier('foo');
      const input = ast.module`
        'pre';
        ${accessor};
        function foo() {}
        'post';
      `;
      const declaration = findAstNode(input, (path): path is NodePath<FunctionDeclaration> =>
        path.isFunctionDeclaration(),
      )!;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === accessor,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'FunctionDeclaration', node: declaration.node },
        { type: 'VariableGetter', node: accessor },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });
  });

  describe('circular references', () => {
    test.skip('mutually recursive variables', () => {
      const declaration1 = t.identifier('foo');
      const declaration2 = t.identifier('bar');
      const accessor1 = t.identifier('foo');
      const accessor2 = t.identifier('bar');
      const assignment1 = t.identifier(declaration1.name);
      const assignment2 = t.identifier(declaration2.name);
      const usage = t.identifier(declaration1.name);
      const input = ast.module`
        'pre';
        let ${declaration1}, ${declaration2};
        ${assignment1} = ${accessor2};
        ${assignment2} = ${accessor1};
        ${usage};
        'post';
      `;
      const target = findAstNode(
        input,
        (path): path is NodePath<Expression> => path.node === usage,
      )!;
      const actual = isReferenceNode(target) ? findReferences(target) : [];
      const expected: ReferenceValues = [
        { type: 'VariableGetter', node: usage },
        { type: 'BindingDeclaration', node: declaration1 },
        { type: 'BindingDeclaration', node: declaration2 },
        { type: 'VariableSetter', node: assignment1 },
        { type: 'VariableSetter', node: assignment2 },
      ];
      expect(stripReferencePaths(actual)).toEqual(expected);
      for (const [actualRef, expectedRef] of zip(actual, expected)) {
        expect(actualRef.path.node).toBe(expectedRef.node);
      }
    });
  });
});

describe.skip(getObjectPropertyReferences, () => {
  test('object literals', () => {
    const property = t.objectProperty(t.identifier('bar'), t.nullLiteral());
    const object = t.objectExpression([property]);
    const input = ast.module`
      'pre';
      ${object};
      'post';
    `;
    const target = findAstNode(
      input,
      (path): path is NodePath<Expression> => path.node === object,
    )!;
    const actual = getObjectPropertyReferences(target, t.identifier('bar'), false);
    const expected: ReferenceValues = [{ type: 'PropertyInitializer', node: property }];
    expect(stripReferencePaths(actual)).toEqual(expected);
    for (const [actualRef, expectedRef] of zip(actual, expected)) {
      expect(actualRef.path.node).toBe(expectedRef.node);
    }
  });

  test('object property assignment', () => {
    const property = t.objectProperty(t.identifier('bar'), t.nullLiteral());
    const object = t.objectExpression([property]);
    const assignment = ast.expression`qux.bar`;
    const input = ast.module`
      'pre';
      const qux = ${object};
      ${assignment} = 3;
      'post';
    `;
    const target = findAstNode(
      input,
      (path): path is NodePath<Expression> => path.node === object,
    )!;
    const actual = getObjectPropertyReferences(target, t.identifier('bar'), false);
    const expected: ReferenceValues = [
      { type: 'PropertyInitializer', node: property },
      { type: 'PropertySetter', node: assignment },
    ];
    expect(stripReferencePaths(actual)).toEqual(expected);
    for (const [actualRef, expectedRef] of zip(actual, expected)) {
      expect(actualRef.path.node).toBe(expectedRef.node);
    }
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

type ReferenceValues = Array<{ type: EnumDiscriminant<Reference>; node: AstNode }>;

function stripReferencePaths(references: Array<Reference>): ReferenceValues {
  return references.map(({ [VARIANT]: type, path: { node } }) => ({ type, node }));
}

function zip<T1, T2>(left: Array<T1>, right: Array<T2>): Array<[T1, T2]> {
  return Array.from({ length: Math.min(left.length, right.length) }, (_, i) => [left[i], right[i]]);
}
