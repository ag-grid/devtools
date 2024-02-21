import {
  GridOptionReplacement,
  getGridOptionReplacements,
  invertOptionalBooleanValue,
  migrateOptionalValue,
  migrateProperty,
  removeProperty,
} from '../../plugins/<%= plugin %>/transform-grid-options';

export const replacements: Array<GridOptionReplacement> = getGridOptionReplacements({
  hello: migrateProperty('greet', migrateOptionalValue()),
  goodbye: removeProperty('The "goodbye" option has been removed. See release notes for upgrade instructions.'),
  friendly: migrateProperty('unfriendly', invertOptionalBooleanValue()),
});
