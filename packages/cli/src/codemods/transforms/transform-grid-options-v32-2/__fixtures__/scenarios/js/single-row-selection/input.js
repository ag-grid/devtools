import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  onRangeSelectionChanged: () => {},
  onRangeDeleteStart: () => {},
  onRangeDeleteEnd: () => {},

  rowSelection: 'single',
  suppressRowClickSelection: true,
  suppressRowDeselection: true,
  isRowSelectable: (params) => params.data.year < 2007,

  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true,
});
