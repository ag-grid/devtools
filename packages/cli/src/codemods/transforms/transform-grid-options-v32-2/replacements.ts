import {
  frameworkWarning,
  getManualInterventionMessage,
  isNonNullJsxPropertyValue,
  migrateDeepProperty,
  migrateOptionalValue,
  migrateProperty,
  ObjectPropertyValue,
  ObjectPropertyValueTransformer,
  removeProperty,
  transformObjectListValue,
  transformObjectProperties,
  transformOptionalValue,
  transformPropertyValue,
  type CodemodObjectPropertyReplacement,
} from '../../plugins/transform-grid-options/transform-grid-options';
import { ast, AstCliContext, AstTransformContext, Types as t } from '@ag-grid-devtools/ast';

const MIGRATION_URL = 'https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  columnDefs: transformPropertyValue(
    transformOptionalValue(
      transformObjectListValue(
        transformObjectProperties({
          checkboxSelection: removeProperty(
            getManualInterventionMessage('checkboxSelection', MIGRATION_URL),
          ),
          headerCheckboxSelection: removeProperty(
            getManualInterventionMessage('headerCheckboxSelection', MIGRATION_URL),
          ),
          headerCheckboxSelectionCurrentPageOnly: removeProperty(
            getManualInterventionMessage('headerCheckboxSelectionCurrentPageOnly', MIGRATION_URL),
          ),
          headerCheckboxSelectionFilteredOnly: removeProperty(
            getManualInterventionMessage('headerCheckboxSelectionFilteredOnly', MIGRATION_URL),
          ),
          showDisabledCheckboxes: removeProperty(
            getManualInterventionMessage('showDisabledCheckboxes', MIGRATION_URL),
          ),
        }),
      ),
    ),
  ),

  onRangeSelectionChanged: migrateProperty('onCellSelectionChanged', migrateOptionalValue()),
  onRangeDeleteStart: migrateProperty('onCellSelectionDeleteStart', migrateOptionalValue()),
  onRangeDeleteEnd: migrateProperty('onCellSelectionDeleteEnd', migrateOptionalValue()),

  rowSelection: migrateDeepProperty(
    ['rowSelection', 'mode'],
    transformOptionalValue(apply(transformRowSelection)),
    getManualInterventionMessage('rowSelection', MIGRATION_URL),
  ),
  suppressRowClickSelection: removeProperty(
    getManualInterventionMessage('suppressRowClickSelection', MIGRATION_URL),
  ),
  suppressRowDeselection: removeProperty(
    getManualInterventionMessage('suppressRowDeselection', MIGRATION_URL),
  ),
  isRowSelectable: migrateDeepProperty(
    ['rowSelection', 'isRowSelectable'],
    migrateOptionalValue(),
    getManualInterventionMessage('isRowSelectable', MIGRATION_URL),
  ),
  rowMultiSelectWithClick: migrateDeepProperty(
    ['rowSelection', 'enableSelectionWithoutKeys'],
    migrateOptionalValue(),
    getManualInterventionMessage('rowMultiSelectWithClick', MIGRATION_URL),
  ),

  groupSelectsChildren: removeProperty(
    getManualInterventionMessage('groupSelectsChildren', MIGRATION_URL),
  ),
  groupSelectsFiltered: removeProperty(
    getManualInterventionMessage('groupSelectsFiltered', MIGRATION_URL),
  ),

  enableRangeSelection: migrateProperty('cellSelection', migrateOptionalValue()),

  suppressMultiRangeSelection: removeProperty(
    getManualInterventionMessage('suppressMultiRangeSelection', MIGRATION_URL),
  ),
  suppressClearOnFillReduction: removeProperty(
    getManualInterventionMessage('suppressClearOnFillReduction', MIGRATION_URL),
  ),
  enableRangeHandle: removeProperty(
    getManualInterventionMessage('enableRangeHandle', MIGRATION_URL),
  ),
  enableFillHandle: removeProperty(getManualInterventionMessage('enableFillHandle', MIGRATION_URL)),
  fillHandleDirection: removeProperty(
    getManualInterventionMessage('fillHandleDirection', MIGRATION_URL),
  ),
  fillOperation: removeProperty(getManualInterventionMessage('fillOperation', MIGRATION_URL)),

  suppressCopyRowsToClipboard: removeProperty(
    getManualInterventionMessage('suppressCopyRowsToClipboard', MIGRATION_URL),
  ),
  suppressCopySingleCellRanges: removeProperty(
    getManualInterventionMessage('suppressCopySingleCellRanges', MIGRATION_URL),
  ),
});

function transformFillHandle(value: ObjectPropertyValue): t.Expression | null {
  if (value.isBooleanLiteral()) {
    if (value.node.value) {
      return ast.expression`'fill'`;
    }
  }

  return null;
}

function transformRangeHandle(value: ObjectPropertyValue): t.Expression | null {
  if (value.isBooleanLiteral()) {
    if (value.node.value) {
      return ast.expression`'range'`;
    }
  }
  return null;
}

function transformRowSelection(value: ObjectPropertyValue): t.Expression | null {
  if (value.isStringLiteral()) {
    switch (value.node.value) {
      case 'single':
        return ast.expression`'singleRow'`;
      case 'multiple':
        return ast.expression`'multiRow'`;
      default:
        break;
    }
  }

  return null;
}

function transformCellSelection(value: ObjectPropertyValue): t.Expression | null {
  if (value.isBooleanLiteral()) {
    if (value.node.value) {
      return ast.expression`'cell'`;
    }
  }

  return null;
}

function apply<S extends AstTransformContext<AstCliContext>>(
  transform: (v: ObjectPropertyValue) => t.Expression | null,
): ObjectPropertyValueTransformer<S> {
  return {
    property(value, accessor, context) {
      return transform(value);
    },
    jsxAttribute(value, element, attribute, context) {
      if (!isNonNullJsxPropertyValue(value)) return null;
      return transform(value);
    },
    angularAttribute(value, component, element, attribute, context) {
      return value;
    },
    vueAttribute(value, component, element, attribute, context) {
      return value === true ? value : value.node;
    },
  };
}
