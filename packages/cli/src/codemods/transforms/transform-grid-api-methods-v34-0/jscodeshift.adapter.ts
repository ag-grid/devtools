import j, { Collection } from 'jscodeshift';
import { AstCliContext, AstTransform, NodePath } from '@ag-grid-devtools/ast';

export type JSCodeShiftTransformer = (root: Collection) => void | any;

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
  return (_babel) => ({
    visitor: {
      Program: {
        exit(path: NodePath) {
          const root: Collection<any> = j((path.hub as any).file.ast);
          const getFirstNode = () => root.find(j.Program).get('body', 0).node;

          // save initial comment if any
          const firstNode = getFirstNode();
          const { comments } = firstNode;

          // transform
          for (const transform of transforms) {
            transform(root);
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
  });
};
