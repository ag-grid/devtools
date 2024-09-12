// @ts-nocheck
import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

gridApi.getDisplayedRowCount();
gridApi?.getDisplayedRowCount();
gridApi!.getDisplayedRowCount();

gridApi.paginationGetRootRowCount();
gridApi?.paginationGetRootRowCount();
gridApi!.paginationGetRootRowCount();

gridApi.paginationGetPageCount();
gridApi?.paginationGetPageCount();
gridApi!.paginationGetPageCount();