import { NodePath, Node } from '@ag-grid-devtools/ast';
import * as t from '@babel/types';
import {
  isIdentifierPath,
  isObjectExpressionPath,
  isObjectPropertyPath,
  isStringLiteralPath,
} from './babel-utils';

type PredicateParams = Record<string, any>;

type SegmentMatchResult =
  | {
      type: keyof typeof t;
      path?: NodePath;
      node?: Node;
    }
  | undefined;

type SegmentMatchFunction = ((path: NodePath) => SegmentMatchResult) & { type?: string };

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
  return fn;
};

export function objectExpression(params: ObjectPropertyParams) {
  return tag('ObjectExpression', function (path: NodePath): SegmentMatchResult {
    const matchPath = isObjectExpressionPath(path) ? path : undefined;

    let matchName = true;

    if (params.name) {
      const keyPath = matchPath?.getSibling('key');

      if (isIdentifierPath(keyPath)) {
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
  return tag('ObjectProperty', function (path: NodePath): SegmentMatchResult {
    const matchPath = isObjectPropertyPath(path) ? path : undefined;

    let matchName = true;

    if (params.name) {
      const keyPath = matchPath?.get('key');

      if (isIdentifierPath(keyPath)) {
        matchName = keyPath.node.name === params.name;
      }
    }

    let matchValue = true;

    if (params.value) {
      const valuePath = matchPath?.get('value');
      if (isStringLiteralPath(valuePath)) {
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
  return tag('Identifier', function (path: NodePath): SegmentMatchResult {
    const matchPath = isIdentifierPath(path) ? path : undefined;

    const matchName = params.name ? matchPath?.node.name === params.name : true;

    let matchValue = true;

    if (params.value) {
      const valuePath = matchPath?.getSibling('value');
      if (isStringLiteralPath(valuePath)) {
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
  results.length === conditions.length ? results : undefined;

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
