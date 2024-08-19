module.exports = [
  new SyntaxError(`The grid option "columnDefs[..].floatingFilterComponentParams.suppressFilterButton" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31-1/

> |         suppressFilterButton: true,
  |         ^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "columnDefs[..].floatingFilterComponentParams.suppressFilterButton" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31-1/

> |         suppressFilterButton: false,
  |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
];
