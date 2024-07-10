import { myCreateGrid } from '@hello/world';
import { createGrid } from '@ag-grid-community/core';

(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  const gridApi = myCreateGrid(document.getQuerySelector('main'), gridOptions);
  gridApi.sizeColumnsToFit();
})();

(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  const gridApi = createGrid(document.getQuerySelector('main'), gridOptions);
  gridApi.sizeColumnsToFit();
})();
