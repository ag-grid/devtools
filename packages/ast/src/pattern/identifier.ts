import { type AstNodeMatcher, type IdentifierPattern, type NodePath, type Types } from '../types';
import { node as t } from '../node';
import { createPatternPlaceholder, createTypedPlaceholder } from '../pattern';

type Identifier = Types.Identifier;

type IdentifierPatternOptions = string | RegExp | ((name: string) => boolean);

export function identifier(match?: IdentifierPatternOptions): IdentifierPattern {
  const placeholder = createTypedPlaceholder('Identifier', t.identifier('_'));
  const matcher = matchIdentifier(match);
  return createPatternPlaceholder(placeholder, matcher);
}

export function matchIdentifier(match?: IdentifierPatternOptions): AstNodeMatcher<Identifier> {
  return (path: NodePath): path is NodePath<Identifier> => {
    if (!path.isIdentifier()) return false;
    const identifierName = path.node.name;
    if (typeof match === 'string') return identifierName === match;
    if (match instanceof RegExp) return match.test(identifierName);
    if (typeof match === 'function') return Boolean(match(identifierName));
    if (!match) return true;
    return false;
  };
}
