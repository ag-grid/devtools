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
  onCellSelectionChanged: onRangeSelectionChanged,
  onCellSelectionDeleteStart: foo,
  onCellSelectionDeleteEnd: () => {},
  enableRangeSelection: cellSelection,
  enableRangeHandle: isEnableRangeHandle(),
  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true,

  selection: {
    suppressMultiRanges: suppressMultiRangeSelection,
    suppressClearOnFillReduction: suppressClearOnFillReduction
  }
});
