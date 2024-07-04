import type { UserConfig, FsUtils, IsGridModuleArgs } from '@ag-grid-devtools/types';
import type { NodePath, PluginObj, PluginPass, Visitor } from '@babel/core';
import type * as BabelCore from '@babel/core';

import { type AstNode } from './ast';

export type { Binding, BindingKind, NodePath, Scope, Visitor } from '@babel/traverse';

export type Babel = typeof BabelCore;
export type BabelPlugin<S = PluginPass> = (babel: Babel) => PluginObj<S>;
export type BabelPluginWithOptions<S = PluginPass, T extends object = object> = [BabelPlugin<S>, T];

export type AstTransform<S extends object> = BabelPlugin<PluginPass & AstTransformContext<S>>;

export interface ImportMatcherResult {
  /** True if the resolution happened via custom user config */
  fromUserConfig: boolean;
}

export type AstTransformWithOptions<
  S extends object = object,
  T extends object = object,
> = BabelPluginWithOptions<PluginPass & AstTransformContext<S>, T>;

export interface AstTransformContext<S extends object = object> extends FileMetadata {
  opts: S;

  _userConfigIsGridModuleCache?: Map<string, IsGridModuleArgs | null>;
  _userConfigIsGridModuleExportCache?: Map<string, ImportMatcherResult | null>;
}

export interface FileMetadata {
  filename: string;
}

export interface TransformContext {
  userConfig?: UserConfig;
}

export interface FsContext extends TransformContext {
  fs: FsUtils;
}

export interface AstCliContext extends FsContext {
  warn(node: NodePath<AstNode> | null, message: string): void;
  fail(node: NodePath<AstNode> | null, message: string): void;
}

export type AstTransformResult = {
  source: string | null;
  errors: Array<Error>;
  warnings: Array<Error>;
};

export type AstNodeVisitor<S extends AstTransformContext<object>> = Visitor<S>;
