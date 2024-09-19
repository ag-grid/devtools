import { createGrid } from '@ag-grid-community/core';

const suppressMultiRangeSelection = true;
const suppressClearOnFillReduction = true;

function onRangeSelectionChanged() {}

function foo() {}

const cellSelection = false;

function isEnableRangeHandle() {}

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  onRangeSelectionChanged,
  onRangeDeleteStart: foo,
  onRangeDeleteEnd: () => {},

  enableRangeSelection: cellSelection,
  enableRangeHandle: isEnableRangeHandle(),
  suppressMultiRangeSelection: suppressMultiRangeSelection,
  suppressClearOnFillReduction,

  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true,
});
