import { createGrid } from '@ag-grid-community/core';

let gridApi;
gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

gridApi.setGridOption('serverSideDatasource', value);
gridApi?.setGridOption('serverSideDatasource', value);
