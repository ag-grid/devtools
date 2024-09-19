import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [{
    field: 'sport',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
  },
  {
    field: 'year',
    checkboxSelection: () => false,
    headerCheckboxSelection: true,
    headerCheckboxSelectionCurrentPageOnly: true,
  }],

  rowData: [],

  selection: {
    mode: "multiRow"
  }
});
