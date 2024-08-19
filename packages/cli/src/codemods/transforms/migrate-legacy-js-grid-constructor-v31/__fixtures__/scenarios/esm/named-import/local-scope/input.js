import { Grid } from '@ag-grid-community/core';
(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  new Grid(document.getQuerySelector('main'), gridOptions);
  gridOptions.api.sizeColumnsToFit();
})();
