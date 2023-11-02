import type { NodePath, PluginObj, PluginPass, Visitor } from '@babel/core';

import { type AstNode } from './ast';

export type { Binding, BindingKind, NodePath, Scope, Visitor } from '@babel/traverse';

export type AstTransform<S extends object> = PluginObj<PluginPass & AstTransformContext<S>>;

export type AstTransformWithOptions<S extends object = object, T extends object = object> = [
  AstTransform<S>,
  T,
];

export interface AstTransformContext<S extends object = object> extends FileMetadata {
  opts: S;
}

export interface FileMetadata {
  filename: string | undefined;
}

export interface AstCliContext {
  applyDangerousEdits: boolean;
  warn(node: NodePath<AstNode> | null, message: string): void;
}

export type AstTransformResult = { source: string | null; errors: Array<Error> };

export type AstNodeVisitor<S extends AstTransformContext<object>> = Visitor<S>;
