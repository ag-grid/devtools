import { createGrid } from '@ag-grid-community/core';

let gridApi;
gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

gridApi.setServerSideDatasource(value);
gridApi?.setServerSideDatasource(value);
