import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

const array = ['bar'];
const flag = true;

gridApi.autoSizeColumns(['foo'], true);
gridApi?.autoSizeColumns(['foo'], false);
gridApi.autoSizeColumns(array, flag);
gridApi.autoSizeColumns(array);
