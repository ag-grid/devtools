import { node as t } from '../node';
import {
  type AstNode,
  type AstNodeMatcher,
  type PatternPlaceholder,
  type PlaceholderType,
  type TypedPlaceholder,
  type Types,
} from '../types';

export * from './expression';
export * from './identifier';

type Identifier = Types.Identifier;
type Placeholder = Types.Placeholder;

export function createPatternPlaceholder<P extends Placeholder, T extends AstNode>(
  placeholder: P,
  matcher: AstNodeMatcher<T>,
): PatternPlaceholder<P['expectedNode'], T> {
  return {
    placeholder,
    matcher,
  };
}

export function createTypedPlaceholder<T extends PlaceholderType>(
  expectedNode: T,
  name: Identifier,
): TypedPlaceholder<T> {
  return t.placeholder(expectedNode, name) as TypedPlaceholder<T>;
}
