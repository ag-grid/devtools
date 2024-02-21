module.exports = [
  new SyntaxError(`The grid option "onColumnRowGroupChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
   5 |   columnDefs: [],
   6 |   rowData: [],
>  7 |   onColumnRowGroupChangeRequest: () => {},
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 |   onColumnPivotChangeRequest: () => {},
   9 |   onColumnValueChangeRequest: () => {},
  10 |   onColumnAggFuncChangeRequest: () => {},`),
  new SyntaxError(`The grid option "onColumnPivotChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
   6 |   rowData: [],
   7 |   onColumnRowGroupChangeRequest: () => {},
>  8 |   onColumnPivotChangeRequest: () => {},
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   9 |   onColumnValueChangeRequest: () => {},
  10 |   onColumnAggFuncChangeRequest: () => {},
  11 | });`),
  new SyntaxError(`The grid option "onColumnValueChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
   7 |   onColumnRowGroupChangeRequest: () => {},
   8 |   onColumnPivotChangeRequest: () => {},
>  9 |   onColumnValueChangeRequest: () => {},
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  10 |   onColumnAggFuncChangeRequest: () => {},
  11 | });
  12 |`),
  new SyntaxError(`The grid option "onColumnAggFuncChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
   8 |   onColumnPivotChangeRequest: () => {},
   9 |   onColumnValueChangeRequest: () => {},
> 10 |   onColumnAggFuncChangeRequest: () => {},
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  11 | });
  12 |`),
];
