import { createGrid } from '@ag-grid-community/core';

var gridApi;
gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

gridApi.setGridOption("serverSideDatasource", value);
