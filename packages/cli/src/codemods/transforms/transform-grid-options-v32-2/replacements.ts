import {
  getDeprecationMessage,
  invertOptionalBooleanValue,
  migrateOptionalValue,
  migrateProperty,
  removeProperty,
  transformObjectProperties,
  type CodemodObjectPropertyReplacement,
} from '../../plugins/transform-grid-options/transform-grid-options';

const MIGRATION_URL = 'https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  hello: migrateProperty('greet', migrateOptionalValue()),
  goodbye: removeProperty(getDeprecationMessage('goodbye', MIGRATION_URL)),
  friendly: migrateProperty('unfriendly', invertOptionalBooleanValue()),
});
