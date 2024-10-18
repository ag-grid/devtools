import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

gridApi.selectAll();
gridApi?.selectAll('api');

gridApi.deselectAll();
gridApi.deselectAll('api');

gridApi.selectAllFiltered('api');
gridApi?.deselectAllFiltered();

gridApi?.selectAllOnCurrentPage();
gridApi.deselectAllOnCurrentPage('api');
