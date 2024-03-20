import {
  ast,
  getNamedObjectLiteralStaticProperty,
  node as t,
  type NodePath,
  type Types,
} from '@ag-grid-devtools/ast';
import {
  CodemodObjectPropertyReplacement,
  ObjectPropertyValue,
  frameworkEvent,
  frameworkWarning,
  getDeprecationMessage,
  transformObjectProperties,
  getManualInterventionMessage,
  invertOptionalBooleanValue,
  isNonNullJsxPropertyValue,
  migrateOptionalValue,
  migrateProperty,
  removeProperty,
  transformOptionalValue,
  transformPropertyValue,
} from '../../plugins/transform-grid-options/transform-grid-options';

type Expression = Types.Expression;
type ObjectMethod = Types.ObjectMethod;

const MIGRATION_URL = 'https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/';

export const replacements: Array<CodemodObjectPropertyReplacement> = transformObjectProperties({
  advancedFilterModel: migrateProperty(
    'initialState',
    transformOptionalValue(
      (() => {
        const warnings = frameworkWarning(
          getManualInterventionMessage('advancedFilterModel', MIGRATION_URL),
        );
        return {
          property(value) {
            return transform(value);
          },
          jsxAttribute(value) {
            if (isNonNullJsxPropertyValue(value)) return transform(value);
            return null;
          },
          angularAttribute: warnings.angularAttribute,
          vueAttribute: warnings.vueAttribute,
        };
        function transform(value: ObjectPropertyValue): Expression {
          return ast.expression`{ filter: { advancedFilterModel: ${value.node} }}`;
        }
      })(),
    ),
  ),
  defaultExcelExportParams: transformPropertyValue(
    transformOptionalValue(
      (() => {
        const warnings = frameworkWarning(
          getManualInterventionMessage('advancedFilterModel', MIGRATION_URL),
        );
        return {
          property(value) {
            if (!value.isExpression()) return value.node;
            return transform(value);
          },
          jsxAttribute(value) {
            if (isNonNullJsxPropertyValue(value)) return transform(value);
            return null;
          },
          angularAttribute: warnings.angularAttribute,
          vueAttribute: warnings.vueAttribute,
        };
        function transform(value: NodePath<Expression>): Expression {
          if (!value.isObjectExpression()) return value.node;
          const exportMode = getNamedObjectLiteralStaticProperty(value, 'exportMode');
          const suppressTextAsCDATA = getNamedObjectLiteralStaticProperty(
            value,
            'suppressTextAsCDATA',
          );
          if (!exportMode && !suppressTextAsCDATA) return value.node;
          return t.objectExpression(
            value.node.properties.filter((property) => {
              if (exportMode && property === exportMode.node) return false;
              if (suppressTextAsCDATA && property === suppressTextAsCDATA.node) return false;
              return true;
            }),
          );
        }
      })(),
    ),
  ),
  enableChartToolPanelsButton: migrateProperty(
    'suppressChartToolPanelsButton',
    invertOptionalBooleanValue(),
  ),
  enterMovesDown: migrateProperty('enterNavigatesVertically', migrateOptionalValue()),
  enterMovesDownAfterEdit: migrateProperty(
    'enterNavigatesVerticallyAfterEdit',
    migrateOptionalValue(),
  ),
  excludeHiddenColumnsFromQuickFilter: migrateProperty(
    'includeHiddenColumnsInQuickFilter',
    invertOptionalBooleanValue(),
  ),
  functionsPassive: removeProperty(getDeprecationMessage('functionsPassive', MIGRATION_URL)),
  getServerSideStoreParams: migrateProperty(
    'getServerSideGroupLevelParams',
    migrateOptionalValue(),
  ),
  processSecondaryColDef: migrateProperty('processPivotResultColDef', migrateOptionalValue()),
  processSecondaryColGroupDef: migrateProperty(
    'processPivotResultColGroupDef',
    migrateOptionalValue(),
  ),
  rememberGroupStateWhenNewData: removeProperty(
    getDeprecationMessage('rememberGroupStateWhenNewData', MIGRATION_URL),
  ),
  rowDataChangeDetectionStrategy: removeProperty(
    getDeprecationMessage('rowDataChangeDetectionStrategy', MIGRATION_URL),
  ),
  serverSideFilterAllLevels: migrateProperty(
    'serverSideOnlyRefreshFilteredGroups',
    invertOptionalBooleanValue(),
  ),
  serverSideFilteringAlwaysResets: migrateProperty(
    'serverSideOnlyRefreshFilteredGroups',
    migrateOptionalValue(),
  ),
  serverSideSortingAlwaysResets: migrateProperty('serverSideSortAllLevels', migrateOptionalValue()),
  serverSideStoreType: migrateProperty(
    'suppressServerSideInfiniteScroll',
    transformOptionalValue(
      (() => {
        const warnings = frameworkWarning(
          getManualInterventionMessage('suppressServerSideInfiniteScroll', MIGRATION_URL),
        );
        return {
          property(value) {
            return transformPropertyValue(value.node);
          },
          jsxAttribute(value, element, attribute, context) {
            if (value === true) return null;
            const { node } = value;
            if (t.isJSXEmptyExpression(node)) return null;
            return transformPropertyValue(node);
          },
          angularAttribute: warnings.angularAttribute,
          vueAttribute: warnings.vueAttribute,
        };
        function transformPropertyValue(value: Expression | ObjectMethod): Expression {
          if (t.isStringLiteral(value)) return t.booleanLiteral(value.value !== 'partial');
          if (!t.isExpression(value)) return t.booleanLiteral(false);
          return t.binaryExpression('!==', value, t.stringLiteral('partial'));
        }
      })(),
    ),
  ),
  suppressAggAtRootLevel: migrateProperty(
    'alwaysAggregateAtRootLevel',
    invertOptionalBooleanValue(),
  ),
  suppressAsyncEvents: removeProperty(getDeprecationMessage('suppressAsyncEvents', MIGRATION_URL)),
  suppressParentsInRowNodes: removeProperty(
    getDeprecationMessage('suppressParentsInRowNodes', MIGRATION_URL),
  ),
  suppressReactUi: removeProperty(getDeprecationMessage('suppressReactUi', MIGRATION_URL)),
  ...frameworkEvent('columnRowGroupChangeRequest', (eventName) =>
    removeProperty(getDeprecationMessage(eventName, MIGRATION_URL)),
  ),
  ...frameworkEvent('columnPivotChangeRequest', (eventName) =>
    removeProperty(getDeprecationMessage(eventName, MIGRATION_URL)),
  ),
  ...frameworkEvent('columnValueChangeRequest', (eventName) =>
    removeProperty(getDeprecationMessage(eventName, MIGRATION_URL)),
  ),
  ...frameworkEvent('columnAggFuncChangeRequest', (eventName) =>
    removeProperty(getDeprecationMessage(eventName, MIGRATION_URL)),
  ),
  ...frameworkEvent('rowDataChanged', (eventName) =>
    migrateProperty(
      eventName.replace(/changed$/, 'updated').replace(/Changed$/, 'Updated'),
      migrateOptionalValue(),
    ),
  ),
});
