/* eslint-disable */
const AgGrid = agGrid;
(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  const gridApi = AgGrid.createGrid(document.getQuerySelector('main'), gridOptions);
  gridApi.sizeColumnsToFit();
})();
