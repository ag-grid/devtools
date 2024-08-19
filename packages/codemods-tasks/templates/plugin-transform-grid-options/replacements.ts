import {
  getDeprecationMessage,
  invertOptionalBooleanValue,
  migrateOptionalValue,
  migrateProperty,
  removeProperty,
  transformObjectProperties,
  type CodemodObjectPropertyReplacement,
} from '../../plugins/<%= plugin %>/transform-grid-options';

const MIGRATION_URL = '<%= migrationUrl %>';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  hello: migrateProperty('greet', migrateOptionalValue()),
  goodbye: removeProperty(getDeprecationMessage('goodbye', MIGRATION_URL)),
  friendly: migrateProperty('unfriendly', invertOptionalBooleanValue()),
});
