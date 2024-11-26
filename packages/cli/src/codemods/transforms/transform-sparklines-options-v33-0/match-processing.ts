import { Node, NodePath } from '@ag-grid-devtools/ast';
import * as t from '@babel/types';
import {
  PredicateParams,
  TypedNodePath,
  MatchResult,
  MatchOperator,
  OrMatchOperator,
  FunctionOperator,
  FunctionMatchResult,
  OrMatchResult,
} from './match-types';

const objectExpression =
  (params: PredicateParams) =>
  (path: NodePath<t.ObjectExpression>): FunctionMatchResult => {
    const matchPath: NodePath<t.ObjectExpression> = path;
    const result = {
      type: path.type,
      params,
      matched: false,
      path: path as any,
      results: [],
    };

    let matchName = false;

    if (params.name) {
      const keyPath = matchPath?.getSibling('key');

      if (keyPath?.isIdentifier()) {
        matchName = keyPath.node.name === params.name;
      }
    }

    if (matchPath && matchName) {
      result.matched = true;
    }
    return result;
  };

export const isObjectExpressionOperator = (
  params: PredicateParams = {},
): FunctionOperator<t.ObjectExpression> => {
  return {
    type: 'ObjectExpression',
    params,
    test: (path: NodePath) => path.isObjectExpression(),
    function: objectExpression(params),
  };
};

export const or = (...matchFunctions: FunctionOperator[]): OrMatchOperator => {
  return {
    type: 'OR',
    operators: matchFunctions,
  };
};

export function processOperator(path: NodePath<Node>, operator: MatchOperator): MatchResult {
  switch (operator.type) {
    case 'OR':
      return processOrOperator(path, operator as OrMatchOperator);
    default:
      return processFunctionOperator(path, operator as FunctionOperator);
  }
}

function processFunctionOperator<T extends Node>(
  path: NodePath<T>,
  operator: FunctionOperator,
): MatchResult {
  return operator.function(path);
}

function processOrOperator(path: NodePath<Node>, operator: OrMatchOperator): OrMatchResult {
  const results = [];
  for (const op of operator.operators) {
    const result = processOperator(path, op);
    results.push(result);
    if (result.matched) {
      break;
    }
  }
  return {
    type: 'OR',
    path,
    matched: results.some((r) => r.matched),
    results,
  };
}

export function process(path: NodePath<Node>, ...operators: MatchOperator[]) {
  const results = [];
  for (const operator of operators) {
    const result = processOperator(path, operator);
    if (result) {
      results.push(result);
    } else {
      return undefined;
    }
  }
  return results;
}
