import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  // Column definitions
  columnDefs: [
    // First column
    {
      // Column ID
      colId: 'foo',
      // Suppress menu
      suppressMenu: false,
      // Column chooser parameters
      columnsMenuParams: {
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
  cellFlashDelay: 1000,
  // Cell fade duration
  cellFadeDelay: 3000,
});
