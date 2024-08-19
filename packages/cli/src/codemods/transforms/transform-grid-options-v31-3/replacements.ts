import {
  getDeprecationMessage,
  removeProperty,
  transformObjectProperties,
  type CodemodObjectPropertyReplacement,
} from '../../plugins/transform-grid-options/transform-grid-options';

const MIGRATION_URL = 'https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31-3/';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  groupIncludeFooter: removeProperty(getDeprecationMessage('groupIncludeFooter', MIGRATION_URL)),
  groupIncludeTotalFooter: removeProperty(
    getDeprecationMessage('groupIncludeTotalFooter', MIGRATION_URL),
  ),
});
