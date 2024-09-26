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

  cellSelection: {
    handle: {
      mode: "range",
      suppressClearOnFillReduction: suppressClearOnFillReduction
    },

    suppressMultiRanges: suppressMultiRangeSelection
  },

  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true
});
