module.exports = [
    new SyntaxError(`The grid option "suppressLoadingOverlay" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32/

> |   suppressLoadingOverlay: true,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
   new SyntaxError(`The grid option "suppressLoadingOverlay" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32/

> |   suppressLoadingOverlay: false,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`)
];
