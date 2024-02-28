import { type Types } from '@ag-grid-devtools/ast';
import {
  getDeprecationMessage,
  transformObjectProperties,
  migrateOptionalValue,
  migrateProperty,
  removeProperty,
  transformObjectListValue,
  transformObjectValue,
  transformOptionalValue,
  transformPropertyValue,
  type CodemodObjectPropertyReplacement,
} from '../../plugins/transform-grid-options/transform-grid-options';

const MIGRATION_URL_V31_1 = 'https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31-1/';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  cellFlashDelay: migrateProperty('cellFlashDuration', migrateOptionalValue()),
  cellFadeDelay: migrateProperty('cellFadeDuration', migrateOptionalValue()),
  columnDefs: transformPropertyValue(
    transformOptionalValue(
      transformObjectListValue(
        transformObjectProperties({
          suppressMenu: migrateProperty('suppressHeaderMenuButton', migrateOptionalValue()),
          columnsMenuParams: migrateProperty('columnChooserParams', migrateOptionalValue()),
          floatingFilterComponentParams: transformPropertyValue(
            transformOptionalValue(
              transformObjectValue(
                transformObjectProperties({
                  suppressFilterButton: removeProperty(
                    getDeprecationMessage(
                      'columnDefs[..].floatingFilterComponentParams.suppressFilterButton',
                      MIGRATION_URL_V31_1,
                    ),
                  ),
                }),
              ),
            ),
          ),
        }),
      ),
    ),
  ),
});
