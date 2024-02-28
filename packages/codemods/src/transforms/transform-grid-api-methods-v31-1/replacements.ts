import {
  ast,
  matchNode,
  node as t,
  pattern as p,
  replace,
  template,
  type Types,
  getStaticPropertyKey,
} from '@ag-grid-devtools/ast';
import {
  type GridApiDeprecation,
  type GridApiReplacement,
} from '../../plugins/transform-grid-api-methods';

type Expression = Types.Expression;
type Identifier = Types.Identifier;
type ObjectExpression = Types.ObjectExpression;
type ObjectProperty = Types.ObjectProperty;
type StringLiteral = Types.StringLiteral;

export const replacements: Array<GridApiReplacement> = [
  replace(
    matchNode(({ api, index }) => ast.expression`${api}.getModel().getRow(${index})`, {
      api: p.expression(),
      index: p.expression(),
    }),
    template(({ api, index }) => ast.expression`${api}.getDisplayedRowAtIndex(${index})`),
  ),
  replace(
    matchNode(({ api, id }) => ast.expression`${api}.getModel().getRowNode(${id})`, {
      api: p.expression(),
      id: p.expression(),
    }),
    template(({ api, id }) => ast.expression`${api}.getRowNode(${id})`),
  ),
  replace(
    matchNode(({ api }) => ast.expression`${api}.getModel().getRowCount()`, {
      api: p.expression(),
    }),
    template(({ api }) => ast.expression`${api}.getDisplayedRowCount()`),
  ),
  replace(
    matchNode(({ api }) => ast.expression`${api}.getModel().isEmpty()`, {
      api: p.expression(),
    }),
    template(({ api }) => ast.expression`${api}.getDisplayedRowCount() === 0`),
  ),
  replace(
    matchNode(({ api, callback }) => ast.expression`${api}.getModel().forEachNode(${callback})`, {
      api: p.expression(),
      callback: p.expression(),
    }),
    template(({ api, callback }) => ast.expression`${api}.forEachNode(${callback})`),
  ),
  replace(
    matchNode(
      ({ api, callback, includeFooterNodes }) =>
        ast.expression`${api}.getModel().forEachNode(${callback}, ${includeFooterNodes})`,
      {
        api: p.expression(),
        callback: p.expression(),
        includeFooterNodes: p.expression(),
      },
    ),
    template(
      ({ api, callback, includeFooterNodes }) =>
        ast.expression`${api}.forEachNode(${callback}, ${includeFooterNodes})`,
    ),
  ),
  replace(
    matchNode(({ api }) => ast.expression`${api}.getFirstDisplayedRow()`, {
      api: p.expression(),
    }),
    template(({ api }) => ast.expression`${api}.getFirstDisplayedRowIndex()`),
  ),
  replace(
    matchNode(({ api }) => ast.expression`${api}.getLastDisplayedRow()`, {
      api: p.expression(),
    }),
    template(({ api }) => ast.expression`${api}.getLastDisplayedRowIndex()`),
  ),
  replace(
    matchNode(({ api, key }) => ast.expression`${api}.getFilterInstance(${key})`, {
      api: p.expression(),
      key: p.expression(),
    }),
    template(({ api, key }) => ast.expression`${api}.getColumnFilterInstance(${key})`),
  ),
  replace(
    matchNode(
      ({ api, key, callback }) => ast.expression`${api}.getFilterInstance(${key}, ${callback})`,
      {
        api: p.expression(),
        key: p.expression(),
        callback: p.expression(),
      },
    ),
    template(
      ({ api, key, callback }) =>
        ast.expression`${api}.getColumnFilterInstance(${key}, ${callback})`,
    ),
  ),
  replace(
    matchNode(({ api, params }) => ast.expression`${api}.flashCells(${params})`, {
      api: p.expression(),
      params: p.expression(),
    }),
    template(({ api, params }) => {
      const transformedParams = transformFlashCellsParams(params);
      return ast.expression`${api}.flashCells(${transformedParams})`;
    }),
  ),
  replace(
    matchNode(({ api, colKey }) => ast.expression`${api}.removeRowGroupColumn(${colKey})`, {
      api: p.expression(),
      colKey: p.expression(),
    }),
    template(({ api, colKey }) => ast.expression`${api}.removeRowGroupColumns([${colKey}])`),
  ),
  replace(
    matchNode(({ api, colKey }) => ast.expression`${api}.addRowGroupColumn(${colKey})`, {
      api: p.expression(),
      colKey: p.expression(),
    }),
    template(({ api, colKey }) => ast.expression`${api}.addRowGroupColumns([${colKey}])`),
  ),
  replace(
    matchNode(
      ({ api, colKey, pinned }) => ast.expression`${api}.setColumnPinned(${colKey}, ${pinned})`,
      {
        api: p.expression(),
        colKey: p.expression(),
        pinned: p.expression(),
      },
    ),
    template(
      ({ api, colKey, pinned }) => ast.expression`${api}.setColumnsPinned([${colKey}], ${pinned})`,
    ),
  ),
  replace(
    matchNode(({ api, colKey }) => ast.expression`${api}.removePivotColumn(${colKey})`, {
      api: p.expression(),
      colKey: p.expression(),
    }),
    template(({ api, colKey }) => ast.expression`${api}.removePivotColumns([${colKey}])`),
  ),
  replace(
    matchNode(({ api, colKey }) => ast.expression`${api}.addPivotColumn(${colKey})`, {
      api: p.expression(),
      colKey: p.expression(),
    }),
    template(({ api, colKey }) => ast.expression`${api}.addPivotColumns([${colKey}])`),
  ),
  replace(
    matchNode(({ api, key, aggFunc }) => ast.expression`${api}.addAggFunc(${key}, ${aggFunc})`, {
      api: p.expression(),
      key: p.expression(),
      aggFunc: p.expression(),
    }),
    template(({ api, key, aggFunc }) => {
      const { key: propertyKey, computed } = t.isStringLiteral(key)
        ? { key: formatStaticObjectPropertyKey(key.value), computed: false }
        : { key, computed: true };
      return ast.expression`${api}.addAggFunc(${t.objectExpression([
        t.objectProperty(propertyKey, aggFunc, computed),
      ])})`;
    }),
  ),
  replace(
    matchNode(({ api, colKey }) => ast.expression`${api}.removeValueColumn(${colKey})`, {
      api: p.expression(),
      colKey: p.expression(),
    }),
    template(({ api, colKey }) => ast.expression`${api}.removeValueColumns([${colKey}])`),
  ),
  replace(
    matchNode(({ api, colKey }) => ast.expression`${api}.addValueColumn(${colKey})`, {
      api: p.expression(),
      colKey: p.expression(),
    }),
    template(({ api, colKey }) => ast.expression`${api}.addValueColumns([${colKey}])`),
  ),
  replace(
    matchNode(({ api, key }) => ast.expression`${api}.autoSizeColumn(${key})`, {
      api: p.expression(),
      key: p.expression(),
    }),
    template(({ api, key }) => ast.expression`${api}.autoSizeColumns([${key}])`),
  ),
  replace(
    matchNode(
      ({ api, key, skipHeader }) => ast.expression`${api}.autoSizeColumn(${key}, ${skipHeader})`,
      {
        api: p.expression(),
        key: p.expression(),
        skipHeader: p.expression(),
      },
    ),
    template(
      ({ api, key, skipHeader }) => ast.expression`${api}.autoSizeColumns([${key}], ${skipHeader})`,
    ),
  ),
  replace(
    matchNode(({ api, key, toIndex }) => ast.expression`${api}.moveColumn(${key}, ${toIndex})`, {
      api: p.expression(),
      key: p.expression(),
      toIndex: p.expression(),
    }),
    template(({ api, key, toIndex }) => ast.expression`${api}.moveColumns([${key}], ${toIndex})`),
  ),
  replace(
    matchNode(
      ({ api, key, newWidth }) => ast.expression`${api}.setColumnWidth(${key}, ${newWidth})`,
      {
        api: p.expression(),
        key: p.expression(),
        newWidth: p.expression(),
      },
    ),
    template(
      ({ api, key, newWidth }) => ast.expression`${api}.setColumnWidths([${key}], ${newWidth})`,
    ),
  ),
  replace(
    matchNode(
      ({ api, key, newWidth, finished }) =>
        ast.expression`${api}.setColumnWidth(${key}, ${newWidth}, ${finished})`,
      {
        api: p.expression(),
        key: p.expression(),
        newWidth: p.expression(),
        finished: p.expression(),
      },
    ),
    template(
      ({ api, key, newWidth, finished }) =>
        ast.expression`${api}.setColumnWidths([${key}], ${newWidth}, ${finished})`,
    ),
  ),
  replace(
    matchNode(
      ({ api, key, newWidth, finished, source }) =>
        ast.expression`${api}.setColumnWidth(${key}, ${newWidth}, ${finished}, ${source})`,
      {
        api: p.expression(),
        key: p.expression(),
        newWidth: p.expression(),
        finished: p.expression(),
        source: p.expression(),
      },
    ),
    template(
      ({ api, key, newWidth, finished, source }) =>
        ast.expression`${api}.setColumnWidths([${key}], ${newWidth}, ${finished}, ${source})`,
    ),
  ),
  replace(
    matchNode(
      ({ api, key, newWidth }) => ast.expression`${api}.setColumnVisible(${key}, ${newWidth})`,
      {
        api: p.expression(),
        key: p.expression(),
        newWidth: p.expression(),
      },
    ),
    template(
      ({ api, key, newWidth }) => ast.expression`${api}.setColumnsVisible([${key}], ${newWidth})`,
    ),
  ),
];

export const deprecations: Array<GridApiDeprecation> = [
  matchNode(
    ({ api, colKey, buttonElement }) =>
      ast.expression`${api}.showColumnMenuAfterButtonClick(${colKey}, ${buttonElement})`,
    {
      api: p.expression(),
      colKey: p.expression(),
      buttonElement: p.expression(),
    },
  ),
  matchNode(
    ({ api, colKey, mouseEvent }) =>
      ast.expression`${api}.showColumnMenuAfterMouseEvent(${colKey}, ${mouseEvent})`,
    {
      api: p.expression(),
      colKey: p.expression(),
      mouseEvent: p.expression(),
    },
  ),
];

function transformFlashCellsParams(params: Expression): Expression {
  if (params.type !== 'ObjectExpression') return params;
  return renameObjectExpressionProperties(params, [
    { from: 'flashDelay', to: 'flashDuration' },
    { from: 'fadeDelay', to: 'fadeDuration' },
  ]);
}

function renameObjectExpressionProperties(
  object: ObjectExpression,
  replacements: Array<{ from: string; to: string }>,
): ObjectExpression {
  const { properties } = object;
  if (replacements.length === 0) return object;
  return t.objectExpression(
    replacements.reduce(
      (properties, replacement) => {
        const existingProperty = properties.find(
          (property): property is ObjectProperty =>
            property.type === 'ObjectProperty' &&
            getStaticPropertyKey(property.key, property.computed) === replacement.from,
        );
        if (!existingProperty) return properties;
        properties[properties.indexOf(existingProperty)] = t.objectProperty(
          t.identifier(replacement.to),
          existingProperty.value,
        );
        return properties;
      },
      [...properties],
    ),
  );
}

function formatStaticObjectPropertyKey(value: string): Identifier | StringLiteral {
  if (/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(value)) return t.identifier(value);
  return t.stringLiteral(value);
}
