import j, { Collection } from 'jscodeshift';
import { AstCliContext, AstTransform, NodePath, Node } from '@ag-grid-devtools/ast';

export type ErrorSpec = { path: j.ASTPath<j.Node>; message: string };

export type JSCodeShiftTransformer = (root: Collection) => void | {
  errors: ErrorSpec[];
  warnings: ErrorSpec[];
};

// Use https://astexplorer.net/ to iterate on your transformer
// Parser: Typescript
// Transform: jscodeshift
//
// NOTE: Less efficient than the raw visitor pattern, but:
// * + easier to write (the tree is already parsed)
// * + easier to reason about
// * + easier to iterate over
// * - multiple passes through parse/transform cycle
export const jsCodeShiftTransform = (
  ...transforms: JSCodeShiftTransformer[]
): AstTransform<AstCliContext> => {
  const errors: Error[] = [];
  const warnings: Error[] = [];
  let source: any;

  return (_babel) => ({
    visitor: {
      Program: {
        exit(path: NodePath) {
          source = (path.hub as any).file.ast;
          const root: Collection<any> = j(source);
          const getFirstNode = () => root.find(j.Program).get('body', 0).node;

          // save initial comment if any
          const firstNode = getFirstNode();
          const { comments } = firstNode;

          // transform
          for (const transform of transforms) {
            const result = transform(root);
            if (result?.errors) {
              errors.push(
                ...result.errors.map((error) =>
                  path.hub.buildError(error.path.node as Node, error.message),
                ),
              );
            }
            if (result?.warnings) {
              warnings.push(
                ...result.warnings.map((warning) =>
                  path.hub.buildError(warning.path.node as Node, warning.message),
                ),
              );
            }
          }

          // restore initial comment if any
          const firstNode2 = getFirstNode();
          if (firstNode2 !== firstNode) {
            firstNode2.comments = comments;
          }

          // inject result back into babel AST
          const program = root.getAST()[0].node.program;
          path.replaceWith(program);
        },
      },
    },
    post(_file) {
      for (const warning of warnings) {
        this.opts.warn(warning, warning.message);
      }

      for (const error of errors) {
        this.opts.fail(error, error.message);
      }
    },
  });
};
