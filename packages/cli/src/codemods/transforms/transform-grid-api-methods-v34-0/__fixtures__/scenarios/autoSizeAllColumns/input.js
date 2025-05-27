import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

const flag = true;

gridApi.autoSizeAllColumns();
gridApi?.autoSizeAllColumns(true);
gridApi?.autoSizeAllColumns(false);
gridApi.autoSizeAllColumns(flag);
