import type { NodePath } from './transform';
import type { PatternVariables, PatternVariableValues } from './pattern';

export interface NodeMatcher<P extends PatternVariables<P>> {
  match: (target: NodePath) => PatternVariableValues<P> | null;
  find: (root: NodePath) => { node: NodePath; refs: PatternVariableValues<P> } | null;
}
