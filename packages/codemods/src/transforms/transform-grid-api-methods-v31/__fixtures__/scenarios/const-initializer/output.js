import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

gridApi?.setGridOption("paginationPageSize", undefined);
gridApi.setGridOption("paginationPageSize", value);
gridApi.setGridOption("advancedFilterBuilderParams", undefined);
gridApi.setGridOption("advancedFilterBuilderParams", value);
gridApi.setGridOption("advancedFilterParent", value);
gridApi.setGridOption("alwaysShowHorizontalScroll", value);
gridApi.setGridOption("alwaysShowVerticalScroll", value);
gridApi.setGridOption("animateRows", value);
gridApi.setGridOption("autoGroupColumnDef", value);
gridApi?.updateGridOptions({
  options: {
    autoGroupColumnDef: value
  },

  source: 'api'
});
gridApi.setGridOption("cacheBlockSize", value);
gridApi.setGridOption("columnDefs", value);
gridApi.updateGridOptions({
  options: {
    columnDefs: value
  },

  source: 'api'
});
gridApi.setGridOption("columnTypes", value);
gridApi.updateGridOptions({
  options: {
    columnTypes: value
  },

  source: 'api'
});
gridApi.setGridOption("datasource", value);
gridApi.setGridOption("dataTypeDefinitions", value);
gridApi.setGridOption("defaultColDef", value);
gridApi.updateGridOptions({
  options: {
    defaultColDef: value
  },

  source: 'api'
});
gridApi.setGridOption("deltaSort", value);
gridApi.setGridOption("doesExternalFilterPass", value);
gridApi.setGridOption("domLayout", undefined);
gridApi.setGridOption("domLayout", value);
gridApi.setGridOption("enableAdvancedFilter", value);
gridApi.setGridOption("enableCellTextSelection", value);
gridApi.setGridOption("includeHiddenColumnsInQuickFilter", !value);
gridApi.updateGridOptions({
  options: {
    includeHiddenColumnsInQuickFilter: !value
  },

  source: 'api'
});
gridApi.setGridOption("fillHandleDirection", value);
gridApi.setGridOption("floatingFiltersHeight", undefined);
gridApi.setGridOption("floatingFiltersHeight", value);
gridApi.setGridOption("functionsReadOnly", value);
gridApi.setGridOption("getBusinessKeyForNode", value);
gridApi.setGridOption("getChartToolbarItems", value);
gridApi.setGridOption("getChildCount", value);
gridApi.setGridOption("getContextMenuItems", value);
gridApi.setGridOption("getDocument", value);
gridApi.setGridOption("getGroupRowAgg", value);
gridApi.setGridOption("getMainMenuItems", value);
gridApi.setGridOption("getRowClass", value);
gridApi.setGridOption("getRowHeight", value);
gridApi.setGridOption("getRowStyle", value);
gridApi.setGridOption("getServerSideGroupKey", value);
gridApi.setGridOption("getServerSideGroupLevelParams", value);
gridApi.setGridOption("groupDisplayType", value);
gridApi.setGridOption("groupHeaderHeight", undefined);
gridApi.setGridOption("groupHeaderHeight", value);
gridApi.setGridOption("groupIncludeFooter", value);
gridApi.setGridOption("groupIncludeTotalFooter", value);
gridApi.setGridOption("groupRemoveLowestSingleChildren", value);
gridApi.setGridOption("groupRemoveSingleChildren", value);
gridApi.setGridOption("headerHeight", undefined);
gridApi.setGridOption("headerHeight", value);
gridApi.setGridOption("includeHiddenColumnsInAdvancedFilter", value);
gridApi.setGridOption("includeHiddenColumnsInQuickFilter", value);
gridApi.setGridOption("initialGroupOrderComparator", value);
gridApi.setGridOption("isApplyServerSideTransaction", value);
gridApi.setGridOption("isExternalFilterPresent", value);
gridApi.setGridOption("isFullWidthRow", value);
gridApi.setGridOption("isRowMaster", value);
gridApi.setGridOption("isRowSelectable", value);
gridApi.setGridOption("isServerSideGroup", value);
gridApi.setGridOption("isServerSideGroupOpenByDefault", value);
gridApi.setGridOption("navigateToNextCell", value);
gridApi.setGridOption("navigateToNextHeader", value);
gridApi.setGridOption("pagination", value);
gridApi.setGridOption("paginationNumberFormatter", value);
gridApi.setGridOption("pinnedBottomRowData", undefined);
gridApi.setGridOption("pinnedBottomRowData", value);
gridApi.setGridOption("pinnedTopRowData", undefined);
gridApi.setGridOption("pinnedTopRowData", value);
gridApi.setGridOption("pivotGroupHeaderHeight", undefined);
gridApi.setGridOption("pivotGroupHeaderHeight", value);
gridApi.setGridOption("pivotHeaderHeight", undefined);
gridApi.setGridOption("pivotHeaderHeight", value);
gridApi.setGridOption("pivotMode", value);
gridApi.setGridOption("popupParent", value);
gridApi.setGridOption("postProcessPopup", value);
gridApi.setGridOption("postSortRows", value);
gridApi.setGridOption("processCellForClipboard", value);
gridApi.setGridOption("processCellFromClipboard", value);
gridApi.setGridOption("processPivotResultColDef", value);
gridApi.setGridOption("processPivotResultColGroupDef", value);
gridApi.setGridOption("processRowPostCreate", value);
gridApi.setGridOption("quickFilterText", value);
gridApi.setGridOption("quickFilterMatcher", undefined);
gridApi.setGridOption("quickFilterMatcher", value);
gridApi.setGridOption("quickFilterParser", undefined);
gridApi.setGridOption("quickFilterParser", value);
gridApi.setGridOption("rowClass", value);
gridApi.setGridOption("rowData", value);
gridApi.setGridOption("rowGroupPanelShow", value);
gridApi.setGridOption("sendToClipboard", value);
gridApi.setGridOption("serverSideDatasource", value);
gridApi.setGridOption("sideBar", value);
gridApi.setGridOption("suppressClipboardPaste", value);
gridApi.setGridOption("suppressModelUpdateAfterUpdateTransaction", value);
gridApi.setGridOption("suppressMoveWhenRowDragging", value);
gridApi.setGridOption("suppressRowClickSelection", value);
gridApi.setGridOption("suppressRowDrag", value);
gridApi.setGridOption("tabToNextCell", value);
gridApi.setGridOption("tabToNextHeader", value);
gridApi.setGridOption("treeData", value);
gridApi.setGridOption("viewportDatasource", value);
