import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [
    {
      colId: 'foo',
    },
    {
      colId: 'bar',
      suppressMenu: false,
      columnsMenuParams: {
        suppressSyncLayoutWithGrid: true,
      },
      floatingFilterComponentParams: {
        suppressFilterButton: true,
      },
    },
    {
      colId: 'baz',
      suppressMenu: true,
      columnsMenuParams: {
        suppressSyncLayoutWithGrid: false,
      },
      floatingFilterComponentParams: {
        suppressFilterButton: false,
      },
    }
  ],
  rowData: [],
  cellFlashDelay: 1000,
  cellFadeDelay: 3000,
});
