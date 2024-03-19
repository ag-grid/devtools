import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [
    {
      colId: 'foo',
    },
    {
      colId: 'bar',
      suppressCellFlash: true,
    },
    {
      colId: 'baz',
      suppressCellFlash: false,
    }
  ],
  rowData: [],
});
