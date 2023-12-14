module.exports = [
  new SyntaxError(`The grid option "onColumnRowGroupChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
  12 |         columnDefs={[]}
  13 |         rowData={[]}
> 14 |         onColumnRowGroupChangeRequest={onColumnRowGroupChangeRequest}
     |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  15 |       />
  16 |     </div>
  17 |   );`),
];
