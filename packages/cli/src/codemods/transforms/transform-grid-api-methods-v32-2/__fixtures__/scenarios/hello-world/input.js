import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

gridApi.getInfiniteRowCount();
gridApi?.getInfiniteRowCount();
