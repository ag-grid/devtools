import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressLoadingOverlay: true,
});

const gridApi2 = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressLoadingOverlay: false,
});