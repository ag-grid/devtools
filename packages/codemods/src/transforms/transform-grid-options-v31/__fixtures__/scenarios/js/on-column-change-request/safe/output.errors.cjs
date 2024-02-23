module.exports = [
  new SyntaxError(`The grid option "onColumnRowGroupChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
  4 |   columnDefs: [],
  5 |   rowData: [],
> 6 |   onColumnRowGroupChangeRequest: () => {},
    |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  7 |   onColumnPivotChangeRequest: () => {},
  8 |   onColumnValueChangeRequest: () => {},
  9 |   onColumnAggFuncChangeRequest: () => {},`),
  new SyntaxError(`The grid option "onColumnPivotChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
   5 |   rowData: [],
   6 |   onColumnRowGroupChangeRequest: () => {},
>  7 |   onColumnPivotChangeRequest: () => {},
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 |   onColumnValueChangeRequest: () => {},
   9 |   onColumnAggFuncChangeRequest: () => {},
  10 | });`),
  new SyntaxError(`The grid option "onColumnValueChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
   6 |   onColumnRowGroupChangeRequest: () => {},
   7 |   onColumnPivotChangeRequest: () => {},
>  8 |   onColumnValueChangeRequest: () => {},
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   9 |   onColumnAggFuncChangeRequest: () => {},
  10 | });
  11 |`),
  new SyntaxError(`The grid option "onColumnAggFuncChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
   7 |   onColumnPivotChangeRequest: () => {},
   8 |   onColumnValueChangeRequest: () => {},
>  9 |   onColumnAggFuncChangeRequest: () => {},
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  10 | });
  11 |`),
];
