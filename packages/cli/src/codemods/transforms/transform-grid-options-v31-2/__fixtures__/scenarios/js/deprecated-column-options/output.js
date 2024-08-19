import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [
    {
      colId: 'foo',
      enableCellChangeFlash: false,
    },
    {
      colId: 'bar',
      enableCellChangeFlash: true,
    },   
  ],
  rowData: [],
});
