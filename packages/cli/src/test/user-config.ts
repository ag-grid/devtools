import { defineUserConfig } from '../user-config';

module.exports = defineUserConfig({
  getCreateGridName() {
    return 'myCreateGrid';
  },

  matchGridImport({ importPath: importedModule }) {
    return importedModule === '@hello/world';
  },

  matchGridImportName({ importName: exported, agGridExportName: match }) {
    if (match === 'Grid') {
      return exported === 'MyGrid';
    }
    return exported === match;
  },
});
