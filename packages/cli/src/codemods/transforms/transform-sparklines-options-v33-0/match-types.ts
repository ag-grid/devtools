import { Node, NodePath } from '@ag-grid-devtools/ast';
import * as t from '@babel/types';

export type TypedNodePath<T = t.Node> = NodePath<T> & { node: T & { type?: string } };
export type PredicateParams = Record<string, any>;

export type MatchResult = {
  type: string;
  matched: boolean;
  path: NodePath;
};

export interface OrMatchResult extends MatchResult {
  type: 'OR';
  matched: boolean;
  results: MatchResult[];
}

export interface FunctionMatchResult extends MatchResult {
  type: keyof t.ParentMaps;
  matched: boolean;
}

type MatchFunction<T extends Node> = ((path: NodePath<T>) => MatchResult) & {
  type?: string;
  params?: PredicateParams[];
};

export type MatchOperator = {
  type: string;
};

export interface OrMatchOperator extends MatchOperator {
  type: 'OR';
  operators: MatchOperator[];
}

export interface FunctionOperator<T extends Node = any> extends MatchOperator {
  type: keyof t.ParentMaps;
  params: PredicateParams;
  test: (path: NodePath) => boolean;
  function: MatchFunction<T>;
}
