import { createGrid } from '@ag-grid-community/core';

const suppressMultiRangeSelection = true;
const suppressClearOnFillReduction = true;

function onRangeSelectionChanged() {}

function foo() {}

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  onRangeSelectionChanged,
  onRangeDeleteStart: foo,
  onRangeDeleteEnd: () => {},

  enableRangeSelection: true,
  enableRangeHandle: true,
  suppressMultiRangeSelection: suppressMultiRangeSelection,
  suppressClearOnFillReduction,

  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true,
});
