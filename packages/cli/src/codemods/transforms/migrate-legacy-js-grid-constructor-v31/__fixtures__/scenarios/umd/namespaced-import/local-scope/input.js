const AgGrid = agGrid;
(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  new AgGrid.Grid(document.getQuerySelector('main'), gridOptions);
  gridOptions.api.sizeColumnsToFit();
})();
