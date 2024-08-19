import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [
    {
      colId: 'foo',
    },
    {
      colId: 'bar',
      enableCellChangeFlash: false,
    },
    {
      colId: 'baz',
      enableCellChangeFlash: true,
    }
  ],
  rowData: [],
});
