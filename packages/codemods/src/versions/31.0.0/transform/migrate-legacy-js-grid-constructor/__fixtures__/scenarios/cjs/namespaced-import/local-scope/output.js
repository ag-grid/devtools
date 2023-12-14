/* eslint-disable */
const AgGrid = require('@ag-grid-community/core');
(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  const gridApi = AgGrid.createGrid(document.getQuerySelector('main'), gridOptions);
  gridApi.sizeColumnsToFit();
})();
