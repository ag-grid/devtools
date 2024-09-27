import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  onCellSelectionChanged: () => {},
  onCellSelectionDeleteStart: () => {},
  onCellSelectionDeleteEnd: () => {},

  rowSelection: {
    mode: "multiRow",
    isRowSelectable: (params) => params.data.year < 2007,
    enableSelectionWithoutKeys: true
  },

  suppressRowClickSelection: true,
  suppressRowDeselection: true,
  groupSelectsChildren: true,
  groupSelectsFiltered: true,
  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true
});
