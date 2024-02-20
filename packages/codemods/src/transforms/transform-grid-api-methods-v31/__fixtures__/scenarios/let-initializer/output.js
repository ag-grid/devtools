/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

let gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

gridApi.setGridOption("serverSideDatasource", value);
