import { ast, matchNode, pattern as p, replace, template } from '@ag-grid-devtools/ast';
import {
  getGridOptionSetterReplacements,
  invertBooleanValue,
  type GridApiDeprecation,
  type GridApiReplacement,
} from '../../plugins/transform-grid-api-methods';

const GRID_API_REPLACEMENTS: Array<GridApiReplacement> = [
  ...['', '?', '!']
    .map((apiOptionalChaining) => [
      replace(
        matchNode(
          ({ api }) => ast.expression`${api}${apiOptionalChaining}.refreshServerSideStore()`,
          {
            api: p.expression(),
          },
        ),
        template(({ api }) => ast.expression`${api}${apiOptionalChaining}.refreshServerSide()`),
      ),
      replace(
        matchNode(
          ({ api, params }) =>
            ast.expression`${api}${apiOptionalChaining}.refreshServerSideStore(${params})`,
          {
            api: p.expression(),
            params: p.expression(),
          },
        ),
        template(
          ({ api, params }) =>
            ast.expression`${api}${apiOptionalChaining}.refreshServerSide(${params})`,
        ),
      ),
      replace(
        matchNode(
          ({ api }) => ast.expression`${api}${apiOptionalChaining}.getServerSideStoreState()`,
          {
            api: p.expression(),
          },
        ),
        template(
          ({ api }) => ast.expression`${api}${apiOptionalChaining}.getServerSideGroupLevelState()`,
        ),
      ),
      replace(
        matchNode(
          ({ api, value }) =>
            ast.expression`${api}${apiOptionalChaining}.setProcessSecondaryColDef(${value})`,
          {
            api: p.expression(),
            value: p.expression(),
          },
        ),
        template(
          ({ api, value }) =>
            ast.expression`${api}${apiOptionalChaining}.setGridOption('processPivotResultColDef', ${value})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, value }) =>
            ast.expression`${api}${apiOptionalChaining}.setProcessSecondaryColGroupDef(${value})`,
          {
            api: p.expression(),
            value: p.expression(),
          },
        ),
        template(
          ({ api, value }) =>
            ast.expression`${api}${apiOptionalChaining}.setGridOption('processPivotResultColGroupDef', ${value})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, value }) =>
            ast.expression`${api}${apiOptionalChaining}.setGetServerSideStoreParams(${value})`,
          {
            api: p.expression(),
            value: p.expression(),
          },
        ),
        template(
          ({ api, value }) =>
            ast.expression`${api}${apiOptionalChaining}.setGridOption('getServerSideGroupLevelParams', ${value})`,
        ),
      ),
    ])
    .flat(),
];

const GRID_API_DEPRECATIONS: Array<GridApiDeprecation> = [
  ...['', '?', '!'].map((apiOptionalChaining) =>
    matchNode(({ api }) => ast.expression`${api}${apiOptionalChaining}.setGetRowId()`, {
      api: p.expression(),
    }),
  ),
];

const COLUMNS_API_REPLACEMENTS: Array<GridApiReplacement> = [
  ...['', '?', '!']
    .map((apiOptionalChaining) => [
      replace(
        matchNode(({ api }) => ast.expression`${api}${apiOptionalChaining}.getAllColumns()`, {
          api: p.expression(),
        }),
        template(({ api }) => ast.expression`${api}${apiOptionalChaining}.getColumns()`),
      ),
      replace(
        matchNode(({ api }) => ast.expression`${api}${apiOptionalChaining}.getPrimaryColumns()`, {
          api: p.expression(),
        }),
        template(({ api }) => ast.expression`${api}${apiOptionalChaining}.getColumns()`),
      ),
      replace(
        matchNode(({ api }) => ast.expression`${api}${apiOptionalChaining}.getSecondaryColumns()`, {
          api: p.expression(),
        }),
        template(({ api }) => ast.expression`${api}${apiOptionalChaining}.getPivotResultColumns()`),
      ),
      replace(
        matchNode(
          ({ api, colDefs }) =>
            ast.expression`${api}${apiOptionalChaining}.setSecondaryColumns(${colDefs})`,
          {
            api: p.expression(),
            colDefs: p.expression(),
          },
        ),
        template(
          ({ api, colDefs }) =>
            ast.expression`${api}${apiOptionalChaining}.setPivotResultColumns(${colDefs})`,
        ),
      ),
      replace(
        matchNode(
          ({ api, pivotKeys, valueColKey }) =>
            ast.expression`${api}${apiOptionalChaining}.getSecondaryPivotColumn(${pivotKeys}, ${valueColKey})`,
          {
            api: p.expression(),
            pivotKeys: p.expression(),
            valueColKey: p.expression(),
          },
        ),
        template(
          ({ api, pivotKeys, valueColKey }) =>
            ast.expression`${api}${apiOptionalChaining}.getPivotResultColumn(${pivotKeys}, ${valueColKey})`,
        ),
      ),
    ])
    .flat(),
];

const RENAMED_GRID_OPTION_SETTERS: Array<GridApiReplacement> = getGridOptionSetterReplacements({
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
});

export const replacements: Array<GridApiReplacement> = [
  ...GRID_API_REPLACEMENTS,
  ...COLUMNS_API_REPLACEMENTS,
  ...RENAMED_GRID_OPTION_SETTERS,
];

export const deprecations: Array<GridApiDeprecation> = GRID_API_DEPRECATIONS;
