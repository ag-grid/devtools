import j, { Collection } from 'jscodeshift';
import { JSCodeShiftTransformer } from './types';
import Parser from '@babel/parser';
import { NodePath } from '@ag-grid-devtools/ast';

// Use https://astexplorer.net/ to iterate on your transformer
// Parser: Typescript
// Transform: jscodeshift
//
// NOTE: Less efficient than the raw visitor pattern, but:
// * + easier to write (the tree is already parsed)
// * + easier to reason about
// * + easier to iterate over
// * - multiple passes through parse/transform cycle

export const jsCodeShiftTransform = (...transforms: JSCodeShiftTransformer[]) => {
  return {
    visitor: {
      Program: {
        exit(path: NodePath) {
          let root: Collection<any>;
          for (const transform of transforms) {
            root = j((path.hub as any).file.ast);

            const getFirstNode = () => root.find(j.Program).get('body', 0).node;

            // save initial comment if any
            const firstNode = getFirstNode();
            const { comments } = firstNode;

            // transform
            const result = transform(root);

            // restore initial comment if any
            const firstNode2 = getFirstNode();
            if (firstNode2 !== firstNode) {
              firstNode2.comments = comments;
            }

            // inject result back into babel AST
            const program = result.getAST()[0].node.program;
            path.replaceWith(program);
          }
        },
      },
    },
  };
};

export const reset = (root: Collection<any>, hardReset = false) => {
  if (hardReset) {
    return j(
      Parser.parse(root.toSource(), {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy'],
      }) as any,
    );
  }

  return root.closest(j.File);
};
