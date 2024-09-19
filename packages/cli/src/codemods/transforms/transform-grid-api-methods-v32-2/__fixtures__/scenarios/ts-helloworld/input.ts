// @ts-nocheck
import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

gridApi.getInfiniteRowCount();
gridApi?.getInfiniteRowCount();
gridApi!.getInfiniteRowCount();

gridApi.paginationGetRowCount();
gridApi?.paginationGetRowCount();
gridApi!.paginationGetRowCount();

gridApi.paginationGetTotalPages();
gridApi?.paginationGetTotalPages();
gridApi!.paginationGetTotalPages();