import {
  getManualInterventionMessage,
  invertOptionalBooleanValue,
  migrateProperty,
  removeProperty,
  transformObjectListValue,
  transformObjectProperties,
  transformOptionalValue,
  transformPropertyValue,
  type CodemodObjectPropertyReplacement,
} from '../../plugins/transform-grid-options/transform-grid-options';

const MIGRATION_URL = 'https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31-2/';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  enableCellChangeFlash: removeProperty(
    getManualInterventionMessage('enableCellChangeFlash', MIGRATION_URL),
  ),
  columnDefs: transformPropertyValue(
    transformOptionalValue(
      transformObjectListValue(
        transformObjectProperties({
          suppressCellFlash: migrateProperty('enableCellChangeFlash', invertOptionalBooleanValue()),
        }),
      ),
    ),
  ),
});
