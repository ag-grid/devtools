import {
  getDeprecationMessage,
  removeProperty,
  transformObjectProperties,
  type CodemodObjectPropertyReplacement
} from '../../plugins/transform-grid-options/transform-grid-options';

const MIGRATION_URL = 'https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32/';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  
  suppressLoadingOverlay: removeProperty(getDeprecationMessage('suppressLoadingOverlay', MIGRATION_URL)),
});
