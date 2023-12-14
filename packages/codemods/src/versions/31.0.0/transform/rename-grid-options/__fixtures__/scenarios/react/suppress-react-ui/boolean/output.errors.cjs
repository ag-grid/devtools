module.exports = [
  new SyntaxError(`The grid option "suppressReactUi" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
   5 |   return (
   6 |     <div>
>  7 |       <AgGridReact columnDefs={[]} rowData={[]} suppressReactUi={true} />
     |                                                 ^^^^^^^^^^^^^^^^^^^^^^
   8 |     </div>
   9 |   );
  10 | }`),
];
