import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  onCellSelectionChanged: () => {},
  onCellSelectionDeleteStart: () => {},
  onCellSelectionDeleteEnd: () => {},
  suppressRowClickSelection: true,
  suppressRowDeselection: true,
  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true,

  selection: {
    mode: "singleRow",
    isRowSelectable: (params) => params.data.year < 2007
  }
});
