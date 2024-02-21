import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

const transform: AstTransform<AstCliContext> = function <%= identifier %>(babel) {
  const { types: t } = babel;
  // FIXME: Return a babel plugin visitor that does something useful
  return {
    visitor: {
      StringLiteral(path) {
        // Convert all string literals to uppercase
        path.replaceWith(t.stringLiteral(path.node.value.toUpperCase()));
        path.skip();
      },
    },
  };
};

export default transform;
