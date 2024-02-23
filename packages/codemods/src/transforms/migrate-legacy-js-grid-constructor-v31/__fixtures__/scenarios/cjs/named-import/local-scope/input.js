const { Grid } = require('@ag-grid-community/core');
(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  new Grid(document.getQuerySelector('main'), gridOptions);
  gridOptions.api.sizeColumnsToFit();
})();
