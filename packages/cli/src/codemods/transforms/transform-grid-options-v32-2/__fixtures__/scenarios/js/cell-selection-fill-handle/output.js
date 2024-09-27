import { createGrid } from '@ag-grid-community/core';

const suppressMultiRangeSelection = true;
const suppressClearOnFillReduction = true;

function onRangeSelectionChanged() {}

function foo() {}

function getFillDirection() {}

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  onCellSelectionChanged: onRangeSelectionChanged,
  onCellSelectionDeleteStart: foo,
  onCellSelectionDeleteEnd: () => {},

  cellSelection: true,
  enableFillHandle: true,
  suppressMultiRangeSelection: suppressMultiRangeSelection,
  suppressClearOnFillReduction,
  fillHandleDirection: getFillDirection(),
  fillOperation: () => {console.log('filling')},

  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true,
});
