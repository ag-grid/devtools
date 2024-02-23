module.exports = [
  new SyntaxError(`The grid option "suppressReactUi" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
  4 |   return (
  5 |     <div>
> 6 |       <AgGridReact columnDefs={[]} rowData={[]} suppressReactUi />
    |                                                 ^^^^^^^^^^^^^^^
  7 |     </div>
  8 |   );
  9 | }`),
];
