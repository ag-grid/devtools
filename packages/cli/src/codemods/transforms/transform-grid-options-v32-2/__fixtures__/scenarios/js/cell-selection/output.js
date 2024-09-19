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
  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true,

  selection: {
    mode: "cell",

    handle: {
      mode: "range"
    },

    suppressMultiRanges: suppressMultiRangeSelection,
    suppressClearOnFillReduction: suppressClearOnFillReduction
  }
});
