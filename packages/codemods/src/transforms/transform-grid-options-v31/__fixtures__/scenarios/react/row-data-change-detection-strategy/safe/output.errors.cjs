module.exports = [
  new SyntaxError(`The grid option "rowDataChangeDetectionStrategy" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
  4 |   return (
  5 |     <div>
> 6 |       <AgGridReact columnDefs={[]} rowData={[]} rowDataChangeDetectionStrategy="DeepValueCheck" />
    |                                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  7 |     </div>
  8 |   );
  9 | }`),
];
