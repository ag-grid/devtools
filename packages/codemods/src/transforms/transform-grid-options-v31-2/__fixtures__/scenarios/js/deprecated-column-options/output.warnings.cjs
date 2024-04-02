module.exports = [
  new SyntaxError(`The grid option "columnDefs[..].dndSource" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31-2/

> |       dndSource: true,
  |       ^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "columnDefs[..].dndSource" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31-2/

> |       dndSource: false,
  |       ^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "columnDefs[..].dndSource" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31-2/

> |       dndSource: () => {},
  |       ^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "columnDefs[..].dndSourceOnRowDrag" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31-2/

> |       dndSourceOnRowDrag: () => {},
  |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
];
