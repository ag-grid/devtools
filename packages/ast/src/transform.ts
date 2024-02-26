import { transformFromAstSync, type BabelFileResult } from '@babel/core';
import {
  type Ast,
  type AstNode,
  type BabelPlugin,
  type BabelPluginWithOptions,
  type FileMetadata,
} from './types';

export function transformAst<S, T extends object = object>(
  node: AstNode,
  plugins: Array<BabelPlugin<S> | BabelPluginWithOptions<S, T>>,
  context: FileMetadata,
  metadata?: { source?: string | null },
): Ast | null {
  const { filename } = context;
  const source = metadata && metadata.source;
  const result = stripBabelTransformErrorFilenamePrefix(() =>
    transformFromAstSync(node, source || undefined, {
      code: false,
      ast: true,
      cloneInputAst: false, // See https://github.com/benjamn/recast#using-a-different-parser
      filename,
      plugins,
    }),
  );
  if (!result) return null;
  return result.ast || null;
}

function stripBabelTransformErrorFilenamePrefix(fn: () => BabelFileResult | null) {
  try {
    return fn();
  } catch (error) {
    // Revert the error message to strip the filename prefix inserted by Babel
    // See https://github.com/babel/babel/commit/298c9a6c3304cdf48b0a57f6787d9956d9548e95#diff-bd8fa6037ad52f62e924aaab99b489a136bad15b46e79cc285be2e124c8b4e7b
    if (
      error instanceof Error &&
      (error as Error & { code?: string }).code === 'BABEL_TRANSFORM_ERROR'
    ) {
      const errorMessage = error.message;
      const filenamePrefixSeparator = ': ';
      const filenamePrefixLength = errorMessage.indexOf(filenamePrefixSeparator);
      if (filenamePrefixLength !== -1) {
        error.message = error.message.slice(filenamePrefixLength + filenamePrefixSeparator.length);
      }
    }
    throw error;
  }
}
