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
  ...['', '?', '!']
    .map((apiCoalesce) => [
      replace(
        matchNode(
          ({ api, index }) => ast.expression`${api}${apiCoalesce}.getModel().getRow(${index})`,
          {
            api: p.expression(),
            index: p.expression(),
          },
        ),
        template(
          ({ api, index }) => ast.expression`${api}${apiCoalesce}.getDisplayedRowAtIndex(${index})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, id }) => ast.expression`${api}${apiCoalesce}.getModel().getRowNode(${id})`,
          {
            api: p.expression(),
            id: p.expression(),
          },
        ),
        template(({ api, id }) => ast.expression`${api}${apiCoalesce}.getRowNode(${id})`),
      ),
      replace(
        matchNode(({ api }) => ast.expression`${api}${apiCoalesce}.getModel().getRowCount()`, {
          api: p.expression(),
        }),
        template(({ api }) => ast.expression`${api}${apiCoalesce}.getDisplayedRowCount()`),
      ),
      replace(
        matchNode(({ api }) => ast.expression`${api}${apiCoalesce}.getModel().isEmpty()`, {
          api: p.expression(),
        }),
        template(({ api }) => ast.expression`${api}${apiCoalesce}.getDisplayedRowCount() === 0`),
      ),
      replace(
        matchNode(
          ({ api, callback }) =>
            ast.expression`${api}${apiCoalesce}.getModel().forEachNode(${callback})`,
          {
            api: p.expression(),
            callback: p.expression(),
          },
        ),
        template(
          ({ api, callback }) => ast.expression`${api}${apiCoalesce}.forEachNode(${callback})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, callback, includeFooterNodes }) =>
            ast.expression`${api}${apiCoalesce}.getModel().forEachNode(${callback}, ${includeFooterNodes})`,
          {
            api: p.expression(),
            callback: p.expression(),
            includeFooterNodes: p.expression(),
          },
        ),
        template(
          ({ api, callback, includeFooterNodes }) =>
            ast.expression`${api}${apiCoalesce}.forEachNode(${callback}, ${includeFooterNodes})`,
        ),
      ),
      replace(
        matchNode(({ api }) => ast.expression`${api}${apiCoalesce}.getFirstDisplayedRow()`, {
          api: p.expression(),
        }),
        template(({ api }) => ast.expression`${api}${apiCoalesce}.getFirstDisplayedRowIndex()`),
      ),
      replace(
        matchNode(({ api }) => ast.expression`${api}${apiCoalesce}.getLastDisplayedRow()`, {
          api: p.expression(),
        }),
        template(({ api }) => ast.expression`${api}${apiCoalesce}.getLastDisplayedRowIndex()`),
      ),
      replace(
        matchNode(
          ({ api, key }) => ast.expression`${api}${apiCoalesce}.getFilterInstance(${key})`,
          {
            api: p.expression(),
            key: p.expression(),
          },
        ),
        template(
          ({ api, key }) => ast.expression`${api}${apiCoalesce}.getColumnFilterInstance(${key})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, key, callback }) =>
            ast.expression`${api}${apiCoalesce}.getFilterInstance(${key}, ${callback})`,
          {
            api: p.expression(),
            key: p.expression(),
            callback: p.expression(),
          },
        ),
        template(
          ({ api, key, callback }) =>
            ast.expression`${api}${apiCoalesce}.getColumnFilterInstance(${key}, ${callback})`,
        ),
      ),
      replace(
        matchNode(({ api, params }) => ast.expression`${api}${apiCoalesce}.flashCells(${params})`, {
          api: p.expression(),
          params: p.expression(),
        }),
        template(({ api, params }) => {
          const transformedParams = transformFlashCellsParams(params);
          return ast.expression`${api}${apiCoalesce}.flashCells(${transformedParams})`;
        }),
      ),
      replace(
        matchNode(
          ({ api, colKey }) => ast.expression`${api}${apiCoalesce}.removeRowGroupColumn(${colKey})`,
          {
            api: p.expression(),
            colKey: p.expression(),
          },
        ),
        template(
          ({ api, colKey }) =>
            ast.expression`${api}${apiCoalesce}.removeRowGroupColumns([${colKey}])`,
        ),
      ),
      replace(
        matchNode(
          ({ api, colKey }) => ast.expression`${api}${apiCoalesce}.addRowGroupColumn(${colKey})`,
          {
            api: p.expression(),
            colKey: p.expression(),
          },
        ),
        template(
          ({ api, colKey }) => ast.expression`${api}${apiCoalesce}.addRowGroupColumns([${colKey}])`,
        ),
      ),
      replace(
        matchNode(
          ({ api, colKey, pinned }) =>
            ast.expression`${api}${apiCoalesce}.setColumnPinned(${colKey}, ${pinned})`,
          {
            api: p.expression(),
            colKey: p.expression(),
            pinned: p.expression(),
          },
        ),
        template(
          ({ api, colKey, pinned }) =>
            ast.expression`${api}${apiCoalesce}.setColumnsPinned([${colKey}], ${pinned})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, colKey }) => ast.expression`${api}${apiCoalesce}.removePivotColumn(${colKey})`,
          {
            api: p.expression(),
            colKey: p.expression(),
          },
        ),
        template(
          ({ api, colKey }) => ast.expression`${api}${apiCoalesce}.removePivotColumns([${colKey}])`,
        ),
      ),
      replace(
        matchNode(
          ({ api, colKey }) => ast.expression`${api}${apiCoalesce}.addPivotColumn(${colKey})`,
          {
            api: p.expression(),
            colKey: p.expression(),
          },
        ),
        template(
          ({ api, colKey }) => ast.expression`${api}${apiCoalesce}.addPivotColumns([${colKey}])`,
        ),
      ),
      replace(
        matchNode(
          ({ api, key, aggFunc }) =>
            ast.expression`${api}${apiCoalesce}.addAggFunc(${key}, ${aggFunc})`,
          {
            api: p.expression(),
            key: p.expression(),
            aggFunc: p.expression(),
          },
        ),
        template(({ api, key, aggFunc }) => {
          const { key: propertyKey, computed } = t.isStringLiteral(key)
            ? { key: formatStaticObjectPropertyKey(key.value), computed: false }
            : { key, computed: true };
          return ast.expression`${api}${apiCoalesce}.addAggFunc(${t.objectExpression([
            t.objectProperty(propertyKey, aggFunc, computed),
          ])})`;
        }),
      ),
      replace(
        matchNode(
          ({ api, colKey }) => ast.expression`${api}${apiCoalesce}.removeValueColumn(${colKey})`,
          {
            api: p.expression(),
            colKey: p.expression(),
          },
        ),
        template(
          ({ api, colKey }) => ast.expression`${api}${apiCoalesce}.removeValueColumns([${colKey}])`,
        ),
      ),
      replace(
        matchNode(
          ({ api, colKey }) => ast.expression`${api}${apiCoalesce}.addValueColumn(${colKey})`,
          {
            api: p.expression(),
            colKey: p.expression(),
          },
        ),
        template(
          ({ api, colKey }) => ast.expression`${api}${apiCoalesce}.addValueColumns([${colKey}])`,
        ),
      ),
      replace(
        matchNode(({ api, key }) => ast.expression`${api}${apiCoalesce}.autoSizeColumn(${key})`, {
          api: p.expression(),
          key: p.expression(),
        }),
        template(({ api, key }) => ast.expression`${api}${apiCoalesce}.autoSizeColumns([${key}])`),
      ),
      replace(
        matchNode(
          ({ api, key, skipHeader }) =>
            ast.expression`${api}${apiCoalesce}.autoSizeColumn(${key}, ${skipHeader})`,
          {
            api: p.expression(),
            key: p.expression(),
            skipHeader: p.expression(),
          },
        ),
        template(
          ({ api, key, skipHeader }) =>
            ast.expression`${api}${apiCoalesce}.autoSizeColumns([${key}], ${skipHeader})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, key, toIndex }) =>
            ast.expression`${api}${apiCoalesce}.moveColumn(${key}, ${toIndex})`,
          {
            api: p.expression(),
            key: p.expression(),
            toIndex: p.expression(),
          },
        ),
        template(
          ({ api, key, toIndex }) =>
            ast.expression`${api}${apiCoalesce}.moveColumns([${key}], ${toIndex})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, key, newWidth }) =>
            ast.expression`${api}${apiCoalesce}.setColumnWidth(${key}, ${newWidth})`,
          {
            api: p.expression(),
            key: p.expression(),
            newWidth: p.expression(),
          },
        ),
        template(
          ({ api, key, newWidth }) =>
            ast.expression`${api}${apiCoalesce}.setColumnWidths([${key}], ${newWidth})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, key, newWidth, finished }) =>
            ast.expression`${api}${apiCoalesce}.setColumnWidth(${key}, ${newWidth}, ${finished})`,
          {
            api: p.expression(),
            key: p.expression(),
            newWidth: p.expression(),
            finished: p.expression(),
          },
        ),
        template(
          ({ api, key, newWidth, finished }) =>
            ast.expression`${api}${apiCoalesce}.setColumnWidths([${key}], ${newWidth}, ${finished})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, key, newWidth, finished, source }) =>
            ast.expression`${api}${apiCoalesce}.setColumnWidth(${key}, ${newWidth}, ${finished}, ${source})`,
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
            ast.expression`${api}${apiCoalesce}.setColumnWidths([${key}], ${newWidth}, ${finished}, ${source})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, key, newWidth }) =>
            ast.expression`${api}${apiCoalesce}.setColumnVisible(${key}, ${newWidth})`,
          {
            api: p.expression(),
            key: p.expression(),
            newWidth: p.expression(),
          },
        ),
        template(
          ({ api, key, newWidth }) =>
            ast.expression`${api}${apiCoalesce}.setColumnsVisible([${key}], ${newWidth})`,
        ),
      ),
    ])
    .flat(),
];

export const deprecations: Array<GridApiDeprecation> = [
  ...['', '?', '!']
    .map((apiCoalesce) => [
      matchNode(
        ({ api, colKey, buttonElement }) =>
          ast.expression`${api}${apiCoalesce}.showColumnMenuAfterButtonClick(${colKey}, ${buttonElement})`,
        {
          api: p.expression(),
          colKey: p.expression(),
          buttonElement: p.expression(),
        },
      ),
      matchNode(
        ({ api, colKey, mouseEvent }) =>
          ast.expression`${api}${apiCoalesce}.showColumnMenuAfterMouseEvent(${colKey}, ${mouseEvent})`,
        {
          api: p.expression(),
          colKey: p.expression(),
          mouseEvent: p.expression(),
        },
      ),
    ])
    .flat(),
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
