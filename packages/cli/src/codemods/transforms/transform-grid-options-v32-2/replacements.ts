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
  ),
  suppressRowClickSelection: removeProperty(
    getManualInterventionMessage('suppressRowClickSelection', MIGRATION_URL),
  ),
  suppressRowDeselection: removeProperty(
    getManualInterventionMessage('suppressRowDeselection', MIGRATION_URL),
  ),
  isRowSelectable: migrateDeepProperty(['selection', 'isRowSelectable'], migrateOptionalValue()),
  rowMultiSelectWithClick: migrateDeepProperty(
    ['selection', 'enableMultiSelectWithClick'],
    migrateOptionalValue(),
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
  ),
  suppressMultiRangeSelection: migrateDeepProperty(
    ['selection', 'suppressMultiRanges'],
    migrateOptionalValue(),
  ),
  suppressClearOnFillReduction: migrateDeepProperty(
    ['selection', 'suppressClearOnFillReduction'],
    migrateOptionalValue(),
  ),
  enableRangeHandle: migrateDeepProperty(
    ['selection', 'handle', 'mode'],
    transformOptionalValue(apply(transformRangeHandle)),
  ),
  enableFillHandle: migrateDeepProperty(
    ['selection', 'handle', 'mode'],
    transformOptionalValue(apply(transformFillHandle)),
  ),
  fillHandleDirection: migrateDeepProperty(
    ['selection', 'handle', 'direction'],
    migrateOptionalValue(),
  ),
  fillOperation: migrateDeepProperty(
    ['selection', 'handle', 'setFillValue'],
    migrateOptionalValue(),
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
  } else if (value.isJSXExpressionContainer()) {
    return transformFillHandle((value as any).get('expression'));
  }

  return ast.expression`undefined`;
}

function transformRangeHandle(value: ObjectPropertyValue): t.Expression {
  if (value.isBooleanLiteral()) {
    if (value.node.value) {
      return ast.expression`'range'`;
    }
  } else if (value.isJSXExpressionContainer()) {
    return transformRangeHandle((value as any).get('expression'));
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
  } else if (value.isJSXExpressionContainer()) {
    return transformRowSelection((value as any).get('expression'));
  }

  return ast.expression`undefined`;
}

function transformCellSelection(value: ObjectPropertyValue): t.Expression {
  if (value.isBooleanLiteral()) {
    if (value.node.value) {
      return ast.expression`'cell'`;
    }
  } else if (value.isJSXExpressionContainer()) {
    return transformCellSelection((value as any).get('expression'));
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
      if (isNonNullJsxPropertyValue(value)) return tff(value);
      return null;
    },
    angularAttribute(value, component, element, attribute, context) {
      return value;
    },
    vueAttribute(value, component, element, attribute, context) {
      return value === true ? value : value.node;
    },
  };
}
