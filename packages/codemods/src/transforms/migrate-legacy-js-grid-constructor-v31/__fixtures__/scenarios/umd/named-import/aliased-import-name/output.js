/* eslint-disable */
const {
  Grid: AgGrid,
  createGrid
} = agGrid;
(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  const gridApi = createGrid(document.getQuerySelector('main'), gridOptions);
  gridApi.sizeColumnsToFit();
})();
