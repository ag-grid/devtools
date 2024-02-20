/* eslint-disable */
const { Grid } = agGrid;
(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  new Grid(document.getQuerySelector('main'), gridOptions);
  gridOptions.api.sizeColumnsToFit();
})();
