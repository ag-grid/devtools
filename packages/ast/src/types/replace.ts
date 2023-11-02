import { type NodePath } from './transform';

export interface Replacement<V, T> {
  replace(source: NodePath): T | null;
  exec(source: NodePath): { node: T; refs: V } | null;
}
