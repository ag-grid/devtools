import { type BabelPlugin, type Types } from '@ag-grid-devtools/ast';

type ImportDeclaration = Types.ImportDeclaration;

export function addModuleImports(imports: Array<ImportDeclaration>): BabelPlugin<any> {
  return function addModuleImports(babel) {
    return {
      visitor: {
        Program(path) {
          const finalExistingImport = path
            .get('body')
            .slice()
            .reverse()
            .find((path) => path.isImportDeclaration());
          if (finalExistingImport) {
            finalExistingImport.insertAfter(imports);
          } else {
            path.unshiftContainer('body', imports);
          }
        },
      },
    };
  };
}
