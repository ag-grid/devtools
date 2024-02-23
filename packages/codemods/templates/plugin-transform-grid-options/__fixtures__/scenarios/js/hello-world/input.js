import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  hello: 'world',
  goodbye: 'world',
  friendly: true,
});
