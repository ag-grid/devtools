module.exports = [
  new SyntaxError(`The grid option "rememberGroupStateWhenNewData" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
  4 |   columnDefs: [],
  5 |   rowData: [],
> 6 |   rememberGroupStateWhenNewData: true,
    |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  7 | });
  8 |`),
];
