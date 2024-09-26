import { createGrid } from '@ag-grid-community/core';

const suppressMultiRangeSelection = true;
const suppressClearOnFillReduction = true;

function onRangeSelectionChanged() {}

function foo() {}

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  onCellSelectionChanged: onRangeSelectionChanged,
  onCellSelectionDeleteStart: foo,
  onCellSelectionDeleteEnd: () => {},

  cellSelection: true,
  enableRangeHandle: true,
  suppressMultiRangeSelection: suppressMultiRangeSelection,
  suppressClearOnFillReduction,

  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true,
});
