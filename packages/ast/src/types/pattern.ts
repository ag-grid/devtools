import type { Expression, Identifier, Placeholder } from '@babel/types';

import type { AstNode } from './ast';
import type { NodePath } from './transform';

export type PlaceholderType = Placeholder['expectedNode'];

export interface PatternPlaceholder<
  V extends PlaceholderType = PlaceholderType,
  T extends AstNode = AstNode,
> {
  placeholder: TypedPlaceholder<V>;
  matcher: AstNodeMatcher<T>;
}

export interface TypedPlaceholder<T extends PlaceholderType> extends Placeholder {
  expectedNode: T;
}

export type PatternVariables<P> = { [K in keyof P]: PatternPlaceholder<PlaceholderType, AstNode> };

export type PatternVariablePlaceholders<P extends {}> = {
  [K in keyof P]: P[K] extends PatternPlaceholder<infer T extends PlaceholderType, AstNode>
    ? TypedPlaceholder<T>
    : never;
};

export type PatternVariableValues<P extends {}> = {
  [K in keyof P]: P[K] extends PatternPlaceholder<PlaceholderType, infer T extends AstNode>
    ? NodePath<T>
    : never;
};

export type PatternVariableNodes<P extends {}> = {
  [K in keyof P]: P[K] extends PatternPlaceholder<PlaceholderType, infer T extends AstNode>
    ? T
    : never;
};

export interface AstNodeMatcher<T extends AstNode = AstNode> {
  (path: NodePath): path is NodePath<T>;
}

export interface ExpressionPattern extends PatternPlaceholder<'Expression', Expression> {}

export interface IdentifierPattern extends PatternPlaceholder<'Identifier', Identifier> {}
