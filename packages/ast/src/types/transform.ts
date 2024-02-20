import { type FsUtils } from '@ag-grid-devtools/types';
import type { NodePath, PluginObj, PluginPass, Visitor } from '@babel/core';
import type * as BabelCore from '@babel/core';

import { type AstNode } from './ast';

export type { Binding, BindingKind, NodePath, Scope, Visitor } from '@babel/traverse';

type Babel = typeof BabelCore;
type BabelPlugin<S = PluginPass> = (babel: Babel) => PluginObj<S>;

export type AstTransform<S extends object> = BabelPlugin<PluginPass & AstTransformContext<S>>;

export type AstTransformWithOptions<S extends object = object, T extends object = object> = [
  AstTransform<S>,
  T,
];

export interface AstTransformContext<S extends object = object> extends FileMetadata {
  opts: S;
}

export interface FileMetadata {
  filename: string;
}

export interface AstCliContext extends FsContext {
  applyDangerousEdits: boolean;
  warn(node: NodePath<AstNode> | null, message: string): void;
  fail(node: NodePath<AstNode> | null, message: string): void;
}

export interface FsContext {
  fs: FsUtils;
}

export type AstTransformResult = { source: string | null; errors: Array<Error> };

export type AstNodeVisitor<S extends AstTransformContext<object>> = Visitor<S>;
