import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [
    { 
      field: 'date',
      rowGroupingHierarchy: ['foo', 'bar'],
    },
    { field: 'country' },
  ],
  rowData: [],
  hello: 'world',
  goodbye: 'world',
  friendly: true,
});
