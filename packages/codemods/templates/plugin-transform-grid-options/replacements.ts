import {
  invertOptionalBooleanValue,
  migrateOptionalValue,
  migrateProperty,
  removeProperty,
  transformObjectProperties,
  type CodemodObjectPropertyReplacement,
} from '../../plugins/<%= plugin %>/transform-grid-options';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  hello: migrateProperty('greet', migrateOptionalValue()),
  goodbye: removeProperty('The "goodbye" option has been removed. See release notes for upgrade instructions.'),
  friendly: migrateProperty('unfriendly', invertOptionalBooleanValue()),
});
