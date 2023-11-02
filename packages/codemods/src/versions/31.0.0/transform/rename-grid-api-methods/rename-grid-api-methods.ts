import {
  ast,
  matchNode,
  node as t,
  pattern as p,
  replace,
  template,
  type AstCliContext,
  type AstTransform,
  type Types,
} from '@ag-grid-devtools/ast';
import { isGridApiReference } from '@ag-grid-devtools/codemod-utils';
import { nonNull } from '@ag-grid-devtools/utils';

type Expression = Types.Expression;

const COLUMNS_API_REPLACEMENTS = [
  replace(
    matchNode(({ api }) => ast.expression`${api}.getAllColumns()`, {
      api: p.expression(),
    }),
    template(({ api }) => ast.expression`${api}.getColumns()`),
  ),
  replace(
    matchNode(({ api }) => ast.expression`${api}.getPrimaryColumns()`, {
      api: p.expression(),
    }),
    template(({ api }) => ast.expression`${api}.getColumns()`),
  ),
  replace(
    matchNode(({ api }) => ast.expression`${api}.getSecondaryColumns()`, {
      api: p.expression(),
    }),
    template(({ api }) => ast.expression`${api}.getPivotResultColumns()`),
  ),
  replace(
    matchNode(({ api, colDefs }) => ast.expression`${api}.setSecondaryColumns(${colDefs})`, {
      api: p.expression(),
      colDefs: p.expression(),
    }),
    template(({ api, colDefs }) => ast.expression`${api}.setPivotResultColumns(${colDefs})`),
  ),
  replace(
    matchNode(
      ({ api, pivotKeys, valueColKey }) =>
        ast.expression`${api}.getSecondaryPivotColumn(${pivotKeys}, ${valueColKey})`,
      {
        api: p.expression(),
        pivotKeys: p.expression(),
        valueColKey: p.expression(),
      },
    ),
    template(
      ({ api, pivotKeys, valueColKey }) =>
        ast.expression`${api}.getPivotResultColumn(${pivotKeys}, ${valueColKey})`,
    ),
  ),
];

const GRID_API_REPLACEMENTS = [
  replace(
    matchNode(({ api }) => ast.expression`${api}.refreshServerSideStore()`, {
      api: p.expression(),
    }),
    template(({ api }) => ast.expression`${api}.refreshServerSide()`),
  ),
  replace(
    matchNode(({ api, params }) => ast.expression`${api}.refreshServerSideStore(${params})`, {
      api: p.expression(),
      params: p.expression(),
    }),
    template(({ api, params }) => ast.expression`${api}.refreshServerSide(${params})`),
  ),
  replace(
    matchNode(({ api }) => ast.expression`${api}.getServerSideStoreState()`, {
      api: p.expression(),
    }),
    template(({ api }) => ast.expression`${api}.getServerSideGroupLevelState()`),
  ),
  replace(
    matchNode(({ api, value }) => ast.expression`${api}.setProcessSecondaryColDef(${value})`, {
      api: p.expression(),
      value: p.expression(),
    }),
    template(
      ({ api, value }) =>
        ast.expression`${api}.setGridOption('processPivotResultColDef', ${value})`,
    ),
  ),
  replace(
    matchNode(({ api, value }) => ast.expression`${api}.setProcessSecondaryColGroupDef(${value})`, {
      api: p.expression(),
      value: p.expression(),
    }),
    template(
      ({ api, value }) =>
        ast.expression`${api}.setGridOption('processPivotResultColGroupDef', ${value})`,
    ),
  ),
  replace(
    matchNode(({ api, value }) => ast.expression`${api}.setGetServerSideStoreParams(${value})`, {
      api: p.expression(),
      value: p.expression(),
    }),
    template(
      ({ api, value }) =>
        ast.expression`${api}.setGridOption('getServerSideGroupLevelParams', ${value})`,
    ),
  ),
];

const RENAMED_GRID_OPTIONS: Record<
  string,
  {
    option: string;
    optionalValue: boolean;
    transformValue: ((value: Expression) => Expression) | null;
    allowCustomSource: boolean;
  }
> = {
  paginationSetPageSize: {
    option: 'paginationPageSize',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setAdvancedFilterBuilderParams: {
    option: 'advancedFilterBuilderParams',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setAdvancedFilterParent: {
    option: 'advancedFilterParent',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setAlwaysShowHorizontalScroll: {
    option: 'alwaysShowHorizontalScroll',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setAlwaysShowVerticalScroll: {
    option: 'alwaysShowVerticalScroll',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setAnimateRows: {
    option: 'animateRows',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setAutoGroupColumnDef: {
    option: 'autoGroupColumnDef',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: true,
  },
  setCacheBlockSize: {
    option: 'cacheBlockSize',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setColumnDefs: {
    option: 'columnDefs',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: true,
  },
  setColumnTypes: {
    option: 'columnTypes',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: true,
  },
  setDatasource: {
    option: 'datasource',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setDataTypeDefinitions: {
    option: 'dataTypeDefinitions',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setDefaultColDef: {
    option: 'defaultColDef',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: true,
  },
  setDeltaSort: {
    option: 'deltaSort',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setDoesExternalFilterPass: {
    option: 'doesExternalFilterPass',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setDomLayout: {
    option: 'domLayout',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setEnableAdvancedFilter: {
    option: 'enableAdvancedFilter',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setEnableCellTextSelection: {
    option: 'enableCellTextSelection',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setExcludeHiddenColumnsFromQuickFilter: {
    option: 'includeHiddenColumnsInQuickFilter',
    optionalValue: false,
    transformValue: invertBooleanValue,
    allowCustomSource: true,
  },
  setFillHandleDirection: {
    option: 'fillHandleDirection',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setFloatingFiltersHeight: {
    option: 'floatingFiltersHeight',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setFunctionsReadOnly: {
    option: 'functionsReadOnly',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetBusinessKeyForNode: {
    option: 'getBusinessKeyForNode',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetChartToolbarItems: {
    option: 'getChartToolbarItems',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetChildCount: {
    option: 'getChildCount',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetContextMenuItems: {
    option: 'getContextMenuItems',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetDocument: {
    option: 'getDocument',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetGroupRowAgg: {
    option: 'getGroupRowAgg',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetMainMenuItems: {
    option: 'getMainMenuItems',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetRowClass: {
    option: 'getRowClass',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetRowHeight: {
    option: 'getRowHeight',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetRowStyle: {
    option: 'getRowStyle',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetServerSideGroupKey: {
    option: 'getServerSideGroupKey',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGetServerSideGroupLevelParams: {
    option: 'getServerSideGroupLevelParams',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGroupDisplayType: {
    option: 'groupDisplayType',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGroupHeaderHeight: {
    option: 'groupHeaderHeight',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setGroupIncludeFooter: {
    option: 'groupIncludeFooter',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGroupIncludeTotalFooter: {
    option: 'groupIncludeTotalFooter',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGroupRemoveLowestSingleChildren: {
    option: 'groupRemoveLowestSingleChildren',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setGroupRemoveSingleChildren: {
    option: 'groupRemoveSingleChildren',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setHeaderHeight: {
    option: 'headerHeight',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setIncludeHiddenColumnsInAdvancedFilter: {
    option: 'includeHiddenColumnsInAdvancedFilter',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setIncludeHiddenColumnsInQuickFilter: {
    option: 'includeHiddenColumnsInQuickFilter',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setInitialGroupOrderComparator: {
    option: 'initialGroupOrderComparator',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setIsApplyServerSideTransaction: {
    option: 'isApplyServerSideTransaction',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setIsExternalFilterPresent: {
    option: 'isExternalFilterPresent',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setIsFullWidthRow: {
    option: 'isFullWidthRow',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setIsRowMaster: {
    option: 'isRowMaster',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setIsRowSelectable: {
    option: 'isRowSelectable',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setIsServerSideGroup: {
    option: 'isServerSideGroup',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setIsServerSideGroupOpenByDefault: {
    option: 'isServerSideGroupOpenByDefault',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setNavigateToNextCell: {
    option: 'navigateToNextCell',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setNavigateToNextHeader: {
    option: 'navigateToNextHeader',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setPagination: {
    option: 'pagination',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setPaginationNumberFormatter: {
    option: 'paginationNumberFormatter',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setPinnedBottomRowData: {
    option: 'pinnedBottomRowData',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setPinnedTopRowData: {
    option: 'pinnedTopRowData',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setPivotGroupHeaderHeight: {
    option: 'pivotGroupHeaderHeight',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setPivotHeaderHeight: {
    option: 'pivotHeaderHeight',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setPivotMode: {
    option: 'pivotMode',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setPopupParent: {
    option: 'popupParent',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setPostProcessPopup: {
    option: 'postProcessPopup',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setPostSortRows: {
    option: 'postSortRows',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setProcessCellForClipboard: {
    option: 'processCellForClipboard',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setProcessCellFromClipboard: {
    option: 'processCellFromClipboard',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setProcessPivotResultColDef: {
    option: 'processPivotResultColDef',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setProcessPivotResultColGroupDef: {
    option: 'processPivotResultColGroupDef',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setProcessRowPostCreate: {
    option: 'processRowPostCreate',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setQuickFilter: {
    option: 'quickFilterText',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setQuickFilterMatcher: {
    option: 'quickFilterMatcher',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setQuickFilterParser: {
    option: 'quickFilterParser',
    optionalValue: true,
    transformValue: null,
    allowCustomSource: false,
  },
  setRowClass: {
    option: 'rowClass',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setRowData: {
    option: 'rowData',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setRowGroupPanelShow: {
    option: 'rowGroupPanelShow',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setSendToClipboard: {
    option: 'sendToClipboard',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setServerSideDatasource: {
    option: 'serverSideDatasource',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setSideBar: {
    option: 'sideBar',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setSuppressClipboardPaste: {
    option: 'suppressClipboardPaste',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setSuppressModelUpdateAfterUpdateTransaction: {
    option: 'suppressModelUpdateAfterUpdateTransaction',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setSuppressMoveWhenRowDragging: {
    option: 'suppressMoveWhenRowDragging',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setSuppressRowClickSelection: {
    option: 'suppressRowClickSelection',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setSuppressRowDrag: {
    option: 'suppressRowDrag',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setTabToNextCell: {
    option: 'tabToNextCell',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setTabToNextHeader: {
    option: 'tabToNextHeader',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setTreeData: {
    option: 'treeData',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
  setViewportDatasource: {
    option: 'viewportDatasource',
    optionalValue: false,
    transformValue: null,
    allowCustomSource: false,
  },
};

const GRID_OPTIONS_REPLACEMENTS = [
  ...Object.entries(RENAMED_GRID_OPTIONS).flatMap(
    ([method, { option, optionalValue, transformValue, allowCustomSource }]) => {
      const transform = transformValue || ((value: Expression) => value);
      // Generate a zero-arg method replacement if method's value is optional
      const nullaryMethod = optionalValue
        ? replace(
            matchNode(({ api }) => ast.expression`${api}.${t.identifier(method)}()`, {
              api: p.expression(),
            }),
            template(
              ({ api }) =>
                ast.expression`${api}.setGridOption(${t.stringLiteral(option)}, undefined)`,
            ),
          )
        : null;
      // Generate a one-arg method replacement for all replaced methods
      const unaryMethod = replace(
        matchNode(({ api, value }) => ast.expression`${api}.${t.identifier(method)}(${value})`, {
          api: p.expression(),
          value: p.expression(),
        }),
        template(
          ({ api, value }) =>
            ast.expression`${api}.setGridOption(${t.stringLiteral(option)}, ${transform(value)})`,
        ),
      );
      // Generate a two-arg method replacement if method allows an optional custom source parameter
      const binaryMethod = allowCustomSource
        ? replace(
            matchNode(
              ({ api, value, source }) =>
                ast.expression`${api}.${t.identifier(method)}(${value}, ${source})`,
              {
                api: p.expression(),
                value: p.expression(),
                source: p.expression(),
              },
            ),
            template(
              ({ api, value, source }) =>
                ast.expression`${api}.updateGridOptions({ options: { ${t.identifier(
                  option,
                )}: ${transform(value)} }, source: ${source} })`,
            ),
          )
        : null;
      return [nullaryMethod, unaryMethod, binaryMethod].filter(nonNull);
    },
  ),
];

const METHOD_REPLACEMENTS = [
  ...COLUMNS_API_REPLACEMENTS,
  ...GRID_API_REPLACEMENTS,
  ...GRID_OPTIONS_REPLACEMENTS,
];

const GRID_API_DEPRECATIONS = [
  matchNode(({ api }) => ast.expression`${api}.setGetRowId()`, {
    api: p.expression(),
  }),
];

const transform: AstTransform<AstCliContext> = {
  visitor: {
    // Transform deprecated Grid API method invocations
    CallExpression(path, context) {
      // Iterate over each of the replacements until a match is found
      for (const replacement of METHOD_REPLACEMENTS) {
        // Attempt to apply the replacement to the current AST node, skipping if the node doesn't match this pattern
        const result = replacement.exec(path);
        if (!result) continue;

        // If this is an incidental match (naming collision with an identically-named user method), skip the replacement
        const { node, refs } = result;
        if (!isGridApiReference(refs.api, context)) continue;

        // We've found a match, so replace the current AST node with the rewritten node and stop processing this node
        // FIXME: Match quote style in generated option key string literal
        path.replaceWith(node);
        return;
      }
      for (const deprecation of GRID_API_DEPRECATIONS) {
        // Attempt to apply the replacement to the current AST node, skipping if the node doesn't match this pattern
        const result = deprecation.match(path);
        if (!result) continue;

        // If this is an incidental match (naming collision with an identically-named user method), skip the replacement
        const { api } = result;
        if (!isGridApiReference(api, context)) continue;

        throw path.buildCodeFrameError('This method has been deprecated');
      }
    },
  },
};

export default transform;

function invertBooleanValue(value: Expression): Expression {
  return t.isBooleanLiteral(value) ? t.booleanLiteral(!value.value) : ast.expression`!${value}`;
}
