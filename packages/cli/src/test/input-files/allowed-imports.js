import { Grid as AgGrid } from '@hello/world';
(() => {
  const gridOptions = { foo: 'bar' };
  gridOptions.baz = 3;
  new AgGrid(document.getQuerySelector('main'), gridOptions);
  gridOptions.api.sizeColumnsToFit();
})();
