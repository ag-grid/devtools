import { NodePath } from '@ag-grid-devtools/ast';
import * as t from '@babel/types';
import * as b from './babel-utils';

export type OrderedRecord<K extends string, V> = Record<K, V>;

export type ComplexTransform = {
  matchOn: OrderedRecord<string, SegmentMatchFunction[]>;
  transformer: (matches: OrderedRecord<string, SegmentMatchResult[]>) => void;
};

type PredicateParams = Record<string, any>;

export type SegmentMatchResult<T = keyof typeof t> =
  | {
      type: string;
      path: NodePath<T>;
    }
  | undefined;

// All nodes have a type string, even if the types don't show it
type TypedNodePath<T = t.Node> = NodePath<T> & { node: T & { type?: string } };

export type SegmentMatchFunction<T = any, R = any> = ((
  path: TypedNodePath<T>,
) => SegmentMatchResult) & {
  type?: string;
};

interface IdentifierPredicateParams extends PredicateParams {
  name?: string;
}

interface ObjectExpressionParams extends PredicateParams {
  name?: string;
}

interface ObjectPropertyParams extends PredicateParams {
  name?: string;
  value?: string;
}

const tag = (type: string, fn: SegmentMatchFunction): SegmentMatchFunction => {
  fn.type = type;
  const typed = function (path: TypedNodePath) {
    if (path.node.type === type) {
      return fn(path);
    }

    return undefined;
  };

  typed.type = type;

  return typed;
};

interface ImportDeclarationParams extends PredicateParams {
  some?: string[];
  all?: string[];
  from?: string;
}

export type ImportDeclarationMatchResult =
  | (SegmentMatchResult<t.ImportDeclaration> & ImportDeclarationParams)
  | undefined;

interface TypeReferenceParams extends PredicateParams {
  name?: string;
}

export function typeReference(params: TypeReferenceParams) {
  return tag('TSTypeReference', function (path: TypedNodePath): SegmentMatchResult {
    const matchPath = path;

    let matchTypeName = true;

    if (params.name) {
      const typeNamePath = matchPath.get('typeName');

      if (b.isIdentifierPath(typeNamePath)) {
        matchTypeName = typeNamePath.node.name === params.name;
      }
    }

    if (matchPath && matchTypeName) {
      return {
        type: 'typeReference',
        ...(params.name ? { name: params.name } : {}),
        path,
      };
    }
    return undefined;
  });
}

export function importDeclaration(params: ImportDeclarationParams) {
  return tag('ImportDeclaration', function (path: TypedNodePath): ImportDeclarationMatchResult {
    const specifiers = path.get('specifiers') as TypedNodePath<t.ImportSpecifier>[];

    let matchContainsAll = true;
    let matchContainsSome = true;

    if (specifiers) {
      if (params.all) {
        matchContainsAll = params.all.every((contains) => {
          return specifiers.some((specifier) => {
            return specifier.node.local.name === contains;
          });
        });
      } else if (params.some) {
        matchContainsSome = params.some.some((contains) => {
          return specifiers.some((specifier) => {
            return specifier.node.local.name === contains;
          });
        });
      }
    }

    const source = path.get('source') as TypedNodePath;
    let matchFrom = true;

    if (b.isLiteralPath(source)) {
      matchFrom = source.value === params.from;
    }

    if (matchContainsAll && matchContainsSome && matchFrom) {
      return {
        type: 'importDeclaration',
        ...(params.all ? { all: params.all } : {}),
        ...(params.some ? { some: params.some } : {}),
        ...(params.from ? { from: params.from } : {}),
        path,
      };
    }

    return undefined;
  });
}

export function objectExpression(params: ObjectPropertyParams) {
  return tag('ObjectExpression', function (path: TypedNodePath): SegmentMatchResult {
    const matchPath = b.isObjectExpressionPath(path) ? path : undefined;

    let matchName = true;

    if (params.name) {
      const keyPath = matchPath?.getSibling('key');

      if (b.isIdentifierPath(keyPath)) {
        matchName = keyPath.node.name === params.name;
      }
    }

    if (matchPath && matchName) {
      return {
        type: 'objectExpression',
        ...(params.name ? { name: params.name } : {}),
        path,
      };
    }
    return undefined;
  });
}

export function objectProperty(params: ObjectExpressionParams) {
  return tag('ObjectProperty', function (path: TypedNodePath): SegmentMatchResult {
    const matchPath = b.isObjectPropertyPath(path) ? path : undefined;

    let matchName = true;

    if (params.name) {
      const keyPath = matchPath?.get('key');

      if (b.isIdentifierPath(keyPath)) {
        matchName = keyPath.node.name === params.name;
      }
    }

    let matchValue = true;

    if (params.value) {
      const valuePath = matchPath?.get('value');
      if (b.isStringLiteralPath(valuePath)) {
        matchValue = valuePath.node.value === params.value;
      }
    }

    if (matchPath && matchName && matchValue) {
      return {
        type: 'objectProperty',
        ...(params.name ? { name: params.name } : {}),
        ...(params.value ? { value: params.value } : {}),
        path,
      };
    }
    return undefined;
  });
}

export function identifier(params: IdentifierPredicateParams) {
  return tag('Identifier', function (path: TypedNodePath): SegmentMatchResult {
    const matchPath = b.isIdentifierPath(path) ? path : undefined;

    const matchName = params.name ? matchPath?.node.name === params.name : true;

    let matchValue = true;

    if (params.value) {
      const valuePath = matchPath?.getSibling('value');
      if (b.isStringLiteralPath(valuePath)) {
        matchValue = valuePath.node.value === params.value;
      }
    }

    if (matchPath && matchName && matchValue) {
      return {
        type: 'identifier',
        ...(params.name ? { name: params.name } : {}),
        ...(params.value ? { value: params.value } : {}),
        path,
      };
    }
    return undefined;
  });
}

const allOrNothing = (results: any[], conditions: any[]) =>
  results.length === conditions.length ? results.reverse() : undefined;

export function match(path: NodePath | null | undefined, segments: SegmentMatchFunction[]) {
  const conditions = [...segments].reverse();

  const stack = [];

  for (const segment of conditions) {
    if (!path) {
      return allOrNothing(stack, conditions);
    }
    const result = segment(path);
    if (!result) {
      return allOrNothing(stack, conditions);
    }
    stack.push(result);
    path = result.path?.parentPath;
  }
  return allOrNothing(stack, conditions);
}
