import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [
    { 
      field: 'date',
      groupHierarchy: ['foo', 'bar'],
    },
    { field: 'country' },
  ],
  rowData: [],
  hello: 'world',
  goodbye: 'world',
  friendly: true,
});
