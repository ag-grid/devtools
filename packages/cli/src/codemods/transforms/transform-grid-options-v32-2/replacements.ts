import {
  migrateDeepProperty,
  migrateOptionalValue,
  migrateProperty,
  ObjectPropertyValue,
  ObjectPropertyValueTransformer,
  transformObjectProperties,
  transformOptionalValue,
  type CodemodObjectPropertyReplacement,
} from '../../plugins/transform-grid-options/transform-grid-options';
import { ast, AstCliContext, AstTransformContext, Types } from '@ag-grid-devtools/ast';

const MIGRATION_URL = 'https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  onRangeSelectionChanged: migrateProperty('onCellSelectionChanged', migrateOptionalValue()),
  onRangeDeleteStart: migrateProperty('onCellSelectionDeleteStart', migrateOptionalValue()),
  onRangeDeleteEnd: migrateProperty('onCellSelectionDeleteEnd', migrateOptionalValue()),

  rowSelection: migrateDeepProperty(
    ['selection', 'mode'],
    transformOptionalValue(tf(transformRowSelection)),
  ),
  suppressRowClickSelection: migrateDeepProperty(
    ['selection', 'suppressClickSelection'],
    migrateOptionalValue(),
  ),
  isRowSelectable: migrateDeepProperty(['selection', 'isRowSelectable'], migrateOptionalValue()),
  rowMultiSelectWithClick: migrateDeepProperty(
    ['selection', 'enableMultiSelectWithClick'],
    migrateOptionalValue(),
  ),

  enableRangeSelection: migrateDeepProperty(
    ['selection', 'mode'],
    transformOptionalValue(tf(transformCellSelection)),
  ),
  suppressMultiRangeSelection: migrateDeepProperty(
    ['selection', 'suppressMultiRanges'],
    migrateOptionalValue(),
  ),
  suppressClearOnFillReduction: migrateDeepProperty(
    ['selection', 'suppressClearOnFillReduction'],
    migrateOptionalValue(),
  ),
  enableRangeHandle: migrateDeepProperty(['selection', 'handle'], migrateOptionalValue()),
  enableFillHandle: migrateDeepProperty(
    ['selection', 'handle', 'mode'],
    transformOptionalValue(tf(transformFillHandle)),
  ),
  fillHandleDirection: migrateDeepProperty(
    ['selection', 'handle', 'direction'],
    migrateOptionalValue(),
  ),
});

function transformFillHandle(value: ObjectPropertyValue): Types.Expression {
  if (value.isBooleanLiteral()) {
    switch (value.node.value) {
      case true:
        return ast.expression`'fill'`;
      default:
        break;
    }
  }

  return ast.expression`undefined`;
}

function transformRowSelection(value: ObjectPropertyValue): Types.Expression {
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

function transformCellSelection(value: ObjectPropertyValue): Types.Expression {
  if (value.isBooleanLiteral()) {
    switch (value.node.value) {
      case true:
        return ast.expression`'cell'`;
      default:
        break;
    }
  }

  return ast.expression`undefined`;
}

function tf<S extends AstTransformContext<AstCliContext>>(
  tff: (v: ObjectPropertyValue) => Types.Expression,
): ObjectPropertyValueTransformer<S> {
  return {
    property(value, accessor, context) {
      return tff(value);
    },
    jsxAttribute(value, element, attribute, context) {
      return value === true ? value : value.node;
    },
    angularAttribute(value, component, element, attribute, context) {
      return value;
    },
    vueAttribute(value, component, element, attribute, context) {
      return value === true ? value : value.node;
    },
  };
}
