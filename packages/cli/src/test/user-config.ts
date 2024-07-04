import { defineUserConfig } from '../user-config';

module.exports = defineUserConfig({
  getCreateGridName() {
    return 'myCreateGrid';
  },

  isGridModule({ importedModule }) {
    return importedModule === '@hello/world';
  },

  isGridModuleExport({ exported, match }) {
    if (match === 'Grid') {
      return exported === 'MyGrid';
    }
    return exported === match;
  },
});
