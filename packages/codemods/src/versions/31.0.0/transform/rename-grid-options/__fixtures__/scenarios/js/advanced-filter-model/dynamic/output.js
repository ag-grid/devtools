/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const advancedFilterModel = {
  filterType: 'join',
  type: 'AND',
  conditions: [],
};

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  initialState: {
    filter: {
      advancedFilterModel: advancedFilterModel
    }
  },
});
