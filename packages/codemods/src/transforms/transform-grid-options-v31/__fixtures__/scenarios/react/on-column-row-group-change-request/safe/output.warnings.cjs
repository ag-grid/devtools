module.exports = [
  new SyntaxError(`The grid option "onColumnRowGroupChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
  11 |         columnDefs={[]}
  12 |         rowData={[]}
> 13 |         onColumnRowGroupChangeRequest={onColumnRowGroupChangeRequest}
     |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  14 |       />
  15 |     </div>
  16 |   );`),
];
