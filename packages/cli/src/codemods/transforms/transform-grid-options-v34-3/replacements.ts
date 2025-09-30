import {
  migrateOptionalValue,
  migrateProperty,
  transformObjectListValue,
  transformObjectProperties,
  transformOptionalValue,
  transformPropertyValue,
  type CodemodObjectPropertyReplacement,
} from '../../plugins/transform-grid-options/transform-grid-options';

const MIGRATION_URL = 'https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-34-3/';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  columnDefs: transformPropertyValue(
    transformOptionalValue(
      transformObjectListValue(
        transformObjectProperties({
          rowGroupingHierarchy: migrateProperty('groupHierarchy', migrateOptionalValue()),
        }),
      ),
    ),
  ),
});
