module.exports = [
  new SyntaxError(`The grid option "suppressReactUi" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/

> |       <AgGridReact columnDefs={[]} rowData={[]} suppressReactUi={true} />
  |                                                 ^^^^^^^^^^^^^^^^^^^^^^`),
];
