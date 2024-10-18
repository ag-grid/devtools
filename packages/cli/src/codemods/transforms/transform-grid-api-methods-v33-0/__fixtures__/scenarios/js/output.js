import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

gridApi.selectAll();
gridApi?.selectAll("all", 'api');

gridApi.deselectAll();
gridApi.deselectAll("all", 'api');

gridApi.selectAll("filtered", 'api');
gridApi?.deselectAll("filtered");

gridApi?.selectAll("currentPage");
gridApi.deselectAll("currentPage", 'api');
