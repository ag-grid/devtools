import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  // Column definitions
  columnDefs: [
    // First column
    {
      // Column ID
      colId: 'foo',
      // Suppress menu
      suppressHeaderMenuButton: false,
      // Column chooser parameters
      columnChooserParams: {
        // Suppress sync layout with grid
        suppressSyncLayoutWithGrid: true,
      },
      // Floating filter component parameters
      floatingFilterComponentParams: {
        // Suppress filter button
        suppressFilterButton: true,
      },
    },
  ],
  // Row data
  rowData: [],
  // Cell flash duration
  cellFlashDuration: 1000,
  // Cell fade duration
  cellFadeDuration: 3000,
});
