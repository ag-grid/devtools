import {
  getManualInterventionMessage,
  isNonNullJsxPropertyValue,
  migrateDeepProperty,
  migrateOptionalValue,
  migrateProperty,
  ObjectPropertyValue,
  ObjectPropertyValueTransformer,
  removeProperty,
  transformObjectProperties,
  transformOptionalValue,
  type CodemodObjectPropertyReplacement,
} from '../../plugins/transform-grid-options/transform-grid-options';
import { ast, AstCliContext, AstTransformContext, Types as t } from '@ag-grid-devtools/ast';

const MIGRATION_URL = 'https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  onRangeSelectionChanged: migrateProperty('onCellSelectionChanged', migrateOptionalValue()),
  onRangeDeleteStart: migrateProperty('onCellSelectionDeleteStart', migrateOptionalValue()),
  onRangeDeleteEnd: migrateProperty('onCellSelectionDeleteEnd', migrateOptionalValue()),

  rowSelection: migrateDeepProperty(
    ['selection', 'mode'],
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
    ['selection', 'isRowSelectable'],
    migrateOptionalValue(),
    getManualInterventionMessage('isRowSelectable', MIGRATION_URL),
  ),
  rowMultiSelectWithClick: migrateDeepProperty(
    ['selection', 'enableMultiSelectWithClick'],
    migrateOptionalValue(),
    getManualInterventionMessage('rowMultiSelectWithClick', MIGRATION_URL),
  ),

  groupSelectsChildren: removeProperty(
    getManualInterventionMessage('groupSelectsChildren', MIGRATION_URL),
  ),
  groupSelectsFiltered: removeProperty(
    getManualInterventionMessage('groupSelectsFiltered', MIGRATION_URL),
  ),

  enableRangeSelection: migrateDeepProperty(
    ['selection', 'mode'],
    transformOptionalValue(apply(transformCellSelection)),
    getManualInterventionMessage('enableRangeSelection', MIGRATION_URL),
  ),
  suppressMultiRangeSelection: migrateDeepProperty(
    ['selection', 'suppressMultiRanges'],
    migrateOptionalValue(),
    getManualInterventionMessage('suppressMultiRangeSelection', MIGRATION_URL),
  ),
  suppressClearOnFillReduction: migrateDeepProperty(
    ['selection', 'suppressClearOnFillReduction'],
    migrateOptionalValue(),
    getManualInterventionMessage('suppressClearOnFillReduction', MIGRATION_URL),
  ),
  enableRangeHandle: migrateDeepProperty(
    ['selection', 'handle', 'mode'],
    transformOptionalValue(apply(transformRangeHandle)),
    getManualInterventionMessage('enableRangeHandle', MIGRATION_URL),
  ),
  enableFillHandle: migrateDeepProperty(
    ['selection', 'handle', 'mode'],
    transformOptionalValue(apply(transformFillHandle)),
    getManualInterventionMessage('enableFillHandle', MIGRATION_URL),
  ),
  fillHandleDirection: migrateDeepProperty(
    ['selection', 'handle', 'direction'],
    migrateOptionalValue(),
    getManualInterventionMessage('fillHandleDirection', MIGRATION_URL),
  ),
  fillOperation: migrateDeepProperty(
    ['selection', 'handle', 'setFillValue'],
    migrateOptionalValue(),
    getManualInterventionMessage('fillOperation', MIGRATION_URL),
  ),

  suppressCopyRowsToClipboard: removeProperty(
    getManualInterventionMessage('suppressCopyRowsToClipboard', MIGRATION_URL),
  ),
  suppressCopySingleCellRanges: removeProperty(
    getManualInterventionMessage('suppressCopySingleCellRanges', MIGRATION_URL),
  ),
});

function transformFillHandle(value: ObjectPropertyValue): t.Expression {
  if (value.isBooleanLiteral()) {
    if (value.node.value) {
      return ast.expression`'fill'`;
    }
  }

  return ast.expression`undefined`;
}

function transformRangeHandle(value: ObjectPropertyValue): t.Expression {
  if (value.isBooleanLiteral()) {
    if (value.node.value) {
      return ast.expression`'range'`;
    }
  }
  return ast.expression`undefined`;
}

function transformRowSelection(value: ObjectPropertyValue): t.Expression {
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

  return ast.expression`undefined`;
}

function transformCellSelection(value: ObjectPropertyValue): t.Expression {
  if (value.isBooleanLiteral()) {
    if (value.node.value) {
      return ast.expression`'cell'`;
    }
  }

  return ast.expression`undefined`;
}

function apply<S extends AstTransformContext<AstCliContext>>(
  tff: (v: ObjectPropertyValue) => t.Expression,
): ObjectPropertyValueTransformer<S> {
  return {
    property(value, accessor, context) {
      return tff(value);
    },
    jsxAttribute(value, element, attribute, context) {
      if (!isNonNullJsxPropertyValue(value)) return null;
      return value.isJSXExpressionContainer() ? tff((value as any).get('expression')) : tff(value);
    },
    angularAttribute(value, component, element, attribute, context) {
      return value;
    },
    vueAttribute(value, component, element, attribute, context) {
      return value === true ? value : value.node;
    },
  };
}
