/* eslint-disable */
const AgGrid = agGrid.createGrid;
(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  const gridApi = AgGrid(document.getQuerySelector('main'), gridOptions);
  gridApi.sizeColumnsToFit();
})();
