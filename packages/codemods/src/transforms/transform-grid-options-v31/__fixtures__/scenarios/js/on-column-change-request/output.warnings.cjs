module.exports = [
  new SyntaxError(`The grid option "onColumnRowGroupChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/

> |   onColumnRowGroupChangeRequest: () => {},
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "onColumnPivotChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/

> |   onColumnPivotChangeRequest: () => {},
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "onColumnValueChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/

> |   onColumnValueChangeRequest: () => {},
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "onColumnAggFuncChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/

> |   onColumnAggFuncChangeRequest: () => {},
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
];
