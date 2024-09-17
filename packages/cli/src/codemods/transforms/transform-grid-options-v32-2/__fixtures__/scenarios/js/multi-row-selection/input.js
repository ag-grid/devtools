import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  onRangeSelectionChanged: () => {},
  onRangeDeleteStart: () => {},
  onRangeDeleteEnd: () => {},

  rowSelection: 'multiple',
  suppressRowClickSelection: true,
  suppressRowDeselection: true,
  isRowSelectable: (params) => params.data.year < 2007,
  rowMultiSelectWithClick: true,
  groupSelectsChildren: true,
  groupSelectsFiltered: true,

  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true,
});
