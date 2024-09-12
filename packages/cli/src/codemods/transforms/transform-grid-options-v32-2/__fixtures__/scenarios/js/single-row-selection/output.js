import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  onCellSelectionChanged: () => {},
  onCellSelectionDeleteStart: () => {},
  onCellSelectionDeleteEnd: () => {},

  selection: {
    mode: "singleRow",
    suppressClickSelection: true,
    isRowSelectable: (params) => params.data.year < 2007
  }
});
