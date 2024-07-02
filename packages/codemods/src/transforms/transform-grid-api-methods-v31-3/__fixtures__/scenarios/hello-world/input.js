import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

const col = 'foo';
const row = {};
gridApi.getValue(col, row);
gridApi?.getValue('colId', row);