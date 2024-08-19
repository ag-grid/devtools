import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [
    {
      colId: 'foo',
    },
    {
      colId: 'bar',
      suppressHeaderMenuButton: false,
      columnChooserParams: {
        suppressSyncLayoutWithGrid: true,
      },
      floatingFilterComponentParams: {
        suppressFilterButton: true,
      },
    },
    {
      colId: 'baz',
      suppressHeaderMenuButton: true,
      columnChooserParams: {
        suppressSyncLayoutWithGrid: false,
      },
      floatingFilterComponentParams: {
        suppressFilterButton: false,
      },
    }
  ],
  rowData: [],
  cellFlashDuration: 1000,
  cellFadeDuration: 3000,
});
