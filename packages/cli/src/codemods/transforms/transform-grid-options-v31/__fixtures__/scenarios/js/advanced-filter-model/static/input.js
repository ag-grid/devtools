import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  advancedFilterModel: {
    filterType: 'join',
    type: 'AND',
    conditions: [],
  },
});
