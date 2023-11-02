import {
  type AstNode,
  type NodeMatcher,
  type NodePath,
  type PatternVariables,
  type PatternVariableNodes,
  type PatternVariableValues,
  type Replacement,
  type Template,
  type TemplateType,
} from './types';

export function replace<P extends PatternVariables<P>, T extends TemplateType>(
  search: NodeMatcher<P>,
  replace: Template<PatternVariableNodes<P>, T>,
): Replacement<PatternVariableValues<P>, T> {
  return {
    replace(target: NodePath): T | null {
      const result = exec(target);
      if (!result) return null;
      return result.node;
    },
    exec,
  };

  function exec(target: NodePath) {
    const refs = search.match(target);
    if (!refs) return null;
    const capturedNodes = Object.fromEntries(
      Object.entries(refs as Record<string, NodePath<AstNode>>).map(([key, value]) => [
        key,
        value.node,
      ]),
    ) as PatternVariableNodes<P>;
    const node = replace.render(capturedNodes);
    return { node, refs };
  }
}
