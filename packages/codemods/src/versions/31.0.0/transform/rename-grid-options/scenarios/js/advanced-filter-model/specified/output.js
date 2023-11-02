/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  initialState: {
    filter: {
      advancedFilterModel: {
        filterType: 'join',
        type: 'AND',
        conditions: [],
      }
    }
  },
});
