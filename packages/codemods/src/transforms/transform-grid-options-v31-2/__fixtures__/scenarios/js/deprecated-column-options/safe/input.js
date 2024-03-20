import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [
    {
      colId: 'foo',
      dndSource: true,
    },
    {
      colId: 'bar',
      dndSource: false,
    },
    {
      colId: 'baz',
      dndSource: () => {},
      dndSourceOnRowDrag: () => {},
    }
  ],
  rowData: [],
});
