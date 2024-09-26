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

  cellSelection: {
    handle: {
      mode: "fill",
      suppressClearOnFillReduction: suppressClearOnFillReduction,
      direction: getFillDirection(),
      setFillValue: () => {console.log('filling')}
    },

    suppressMultiRanges: suppressMultiRangeSelection
  },

  suppressCopyRowsToClipboard: true,
  suppressCopySingleCellRanges: true
});
