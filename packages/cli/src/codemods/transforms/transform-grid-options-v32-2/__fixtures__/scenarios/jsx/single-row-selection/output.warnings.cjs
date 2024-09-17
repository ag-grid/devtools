module.exports = [
    new SyntaxError(`The grid option "suppressRowClickSelection" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |       suppressRowClickSelection
  |       ^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "suppressRowDeselection" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |       suppressRowDeselection
  |       ^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "suppressCopyRowsToClipboard" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |       suppressCopyRowsToClipboard
  |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "suppressCopySingleCellRanges" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |       suppressCopySingleCellRanges
  |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
];
