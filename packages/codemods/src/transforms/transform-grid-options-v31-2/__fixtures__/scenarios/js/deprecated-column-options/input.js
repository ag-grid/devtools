import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [
    {
      colId: 'foo',
      suppressCellFlash: true,
    },
    {
      colId: 'bar',
      suppressCellFlash: false,
    },   
  ],
  rowData: [],
});
