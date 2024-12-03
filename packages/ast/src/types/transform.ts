import type {
  UserConfig,
  FsUtils,
  MatchGridImportArgs,
  MatchGridImportNameArgs,
} from '@ag-grid-devtools/types';
import type { NodePath, PluginObj, PluginPass, Visitor } from '@babel/core';
import type * as BabelCore from '@babel/core';

import { type AstNode } from './ast';

export type { Binding, BindingKind, NodePath, Scope, Visitor } from '@babel/traverse';

export type Babel = typeof BabelCore;
export type BabelPlugin<S = PluginPass> = (babel: Babel) => PluginObj<S>;
export type BabelPluginWithOptions<S = PluginPass, T extends object = object> = [BabelPlugin<S>, T];

export type AstTransform<S extends object> = BabelPlugin<PluginPass & AstTransformContext<S>>;

export interface ImportMatcherResult {
  /** Contains the arguments passed to UserConfig.matchGridImportName, if this is a customized import */
  fromUserConfig: MatchGridImportNameArgs | null;
}

export type AstTransformWithOptions<
  S extends object = object,
  T extends object = object,
> = BabelPluginWithOptions<PluginPass & AstTransformContext<S>, T>;

export interface AstTransformContext<S extends object = object> extends FileMetadata {
  opts: S;

  _userConfigIsGridModuleCache?: Map<string, MatchGridImportArgs | null>;
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

export interface LogOptions {
  forceOutput?: boolean;
}

export interface AstCliContext extends FsContext {
  warn(node: NodePath<AstNode> | null, message: string | Error, options?: LogOptions): void;
  fail(node: NodePath<AstNode> | null, message: string | Error, options?: LogOptions): void;
}

export type AstTransformResult = {
  source: string | null;
  errors: Array<Error>;
  warnings: Array<Error>;
};

export type AstNodeVisitor<S extends AstTransformContext<object>> = Visitor<S>;
