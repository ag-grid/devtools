import { defineUserConfig } from '../../user-config';

module.exports = defineUserConfig({
  getCreateGridName() {
    return 'myCreateGrid';
  },

  matchGridImport({ importPath: importedModule }) {
    return importedModule === '@hello/world';
  },

  matchGridImportName({ importName, agGridExportName }) {
    if (agGridExportName === 'Grid') {
      return importName === 'MyGrid';
    }
    return agGridExportName === agGridExportName;
  },
});
