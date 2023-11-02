import { getNodeChildEntries, getNodePropertyFieldNames, node as t } from './node';
import {
  type AstNode,
  type AstNodeMatcher,
  type NodeMatcher,
  type NodePath,
  type PatternPlaceholder,
  type PatternVariablePlaceholders,
  type PatternVariableValues,
  type PatternVariables,
  type Types,
} from './types';

type Placeholder = Types.Placeholder;

type PlaceholderDefinitions = Map<Placeholder, { key: string; matcher: AstNodeMatcher }>;

type PlaceholderCaptures = Map<
  Placeholder,
  { key: string; matcher: AstNodeMatcher; value: NodePath | null }
>;

export function matchNode<P extends PatternVariables<P>>(
  template: (variables: PatternVariablePlaceholders<P>) => AstNode,
  variables: P,
): NodeMatcher<P> {
  const placeholderDefinitions = generatePlaceholderInstances(variables);
  const templatePlaceholders = generateTemplatePlaceholders(placeholderDefinitions);
  const pattern = template(templatePlaceholders as PatternVariablePlaceholders<P>);
  return { match, find };

  function match(target: NodePath): PatternVariableValues<P> | null {
    const captures = generatePlaceholderCaptures(placeholderDefinitions);
    const results = matchExpression(target, pattern, captures);
    if (!results || Array.from(results.values()).some(({ value }) => value === null)) return null;
    const capturedValues = Object.fromEntries(
      Array.from(results.values()).map(({ key, value }) => [key, value]),
    ) as PatternVariableValues<P>;
    return capturedValues;
  }

  function find(root: NodePath): { node: NodePath; refs: PatternVariableValues<P> } | null {
    const result = match(root);
    if (result) return { node: root, refs: result };
    return getNodeChildEntries(root)
      .map(([, value]) => value)
      .reduce(
        function childReducer(
          result,
          child,
        ): { node: NodePath; refs: PatternVariableValues<P> } | null {
          if (result) return result;
          if (!child) return null;
          if (Array.isArray(child)) return child.reduce(childReducer, result);
          return find(child);
        },
        null as { node: NodePath; refs: PatternVariableValues<P> } | null,
      );
  }
}

function generatePlaceholderInstances(
  variables: Record<string, PatternPlaceholder>,
): PlaceholderDefinitions {
  return new Map(
    Object.entries(variables).map(
      ([key, { placeholder, matcher }]): [
        Placeholder,
        { key: string; matcher: AstNodeMatcher },
      ] => [{ ...placeholder }, { key, matcher }],
    ),
  );
}

function generateTemplatePlaceholders(
  definitions: PlaceholderDefinitions,
): Record<string, Placeholder> {
  return Object.fromEntries(
    Array.from(definitions.entries()).map(([placeholder, { key }]) => [key, placeholder]),
  );
}

function generatePlaceholderCaptures(placeholders: PlaceholderDefinitions): PlaceholderCaptures {
  return new Map(
    Array.from(placeholders.entries()).map(([placeholder, { key, matcher }]) => [
      placeholder,
      { key, matcher, value: null as NodePath | null },
    ]),
  );
}

function matchExpression(
  path: NodePath,
  pattern: AstNode,
  captures: PlaceholderCaptures,
): PlaceholderCaptures | null {
  const capture = t.isPlaceholder(pattern) ? captures.get(pattern) : null;
  if (capture) {
    const isMatch = capture.matcher(path);
    if (!isMatch) return null;
    capture.value = path;
    return captures;
  }
  return matchNodeLiteral(path, pattern, captures);
}

function matchNodeLiteral(
  path: NodePath,
  pattern: AstNode,
  captures: PlaceholderCaptures,
): PlaceholderCaptures | null {
  if (path.type !== pattern.type) return null;
  if (!matchNodeProperties(path.node, pattern)) return null;
  return matchNodeChildren(path, pattern, captures);
}

function matchNodeProperties(node: AstNode, pattern: AstNode): boolean {
  if (node.type !== pattern.type) return false;
  return getNodePropertyFieldNames(node).every((key) => deepEqual(node[key], pattern[key]));
}

function matchNodeChildren(
  path: NodePath,
  pattern: AstNode,
  captures: PlaceholderCaptures,
): PlaceholderCaptures | null {
  return getNodeChildEntries(path)
    .map(([propertyName, value]): [typeof value, AstNode | Array<AstNode> | null] => {
      const patternValue = pattern[propertyName] as AstNode | Array<AstNode> | null | undefined;
      return [value, patternValue || null];
    })
    .reduce(
      (captures, [propertyValue, patternValue]) => {
        if (!captures) return null;
        return matchNodeChildProperty(propertyValue, patternValue, captures);
      },
      captures as typeof captures | null,
    );
}

function matchNodeChildProperty(
  value: NodePath | Array<NodePath> | null,
  pattern: AstNode | Array<AstNode> | null,
  captures: PlaceholderCaptures,
): PlaceholderCaptures | null {
  if (!value || !pattern) {
    return value === pattern ? captures : null;
  }
  if (Array.isArray(value) || Array.isArray(pattern)) {
    return Array.isArray(value) && Array.isArray(pattern)
      ? matchNodeArray(value, pattern, captures)
      : null;
  }
  return matchExpression(value, pattern, captures);
}

function matchNodeArray(
  value: Array<NodePath>,
  pattern: Array<AstNode>,
  captures: PlaceholderCaptures,
): PlaceholderCaptures | null {
  if (value.length !== pattern.length) return null;
  return value.reduce(
    (captures, item, index) => {
      if (!captures) return null;
      return matchExpression(item, pattern[index], captures);
    },
    captures as typeof captures | null,
  );
}

function deepEqual(left: unknown, right: unknown): boolean {
  if (!left || !right) return left === right;
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    if (left.length !== right.length) return false;
    return left.every((value, index) => deepEqual(value, right[index]));
  }
  if (typeof left === 'object' || typeof right === 'object') {
    if (typeof left !== 'object' || typeof right !== 'object') return false;
    const keys = Object.keys(left) as Array<keyof typeof left>;
    if (Object.keys(right).length !== keys.length) return false;
    return keys.every((key) => deepEqual(left[key], right[key]));
  }
  return left === right;
}
