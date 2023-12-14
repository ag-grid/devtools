/* eslint-disable */
const { Grid: AgGrid } = require('@ag-grid-community/core');
(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  new AgGrid(document.getQuerySelector('main'), gridOptions);
  gridOptions.api.sizeColumnsToFit();
})();
