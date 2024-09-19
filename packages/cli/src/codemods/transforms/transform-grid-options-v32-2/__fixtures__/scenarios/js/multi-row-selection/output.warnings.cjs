module.exports = [
    new SyntaxError(`The grid option "suppressRowClickSelection" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |   suppressRowClickSelection: true,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
    new SyntaxError(`The grid option "suppressRowDeselection" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |   suppressRowDeselection: true,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "groupSelectsChildren" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |   groupSelectsChildren: true,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^`),
    new SyntaxError(`The grid option "groupSelectsFiltered" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |   groupSelectsFiltered: true,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^`),
    new SyntaxError(`The grid option "suppressCopyRowsToClipboard" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |   suppressCopyRowsToClipboard: true,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
    new SyntaxError(`The grid option "suppressCopySingleCellRanges" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |   suppressCopySingleCellRanges: true,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
];
