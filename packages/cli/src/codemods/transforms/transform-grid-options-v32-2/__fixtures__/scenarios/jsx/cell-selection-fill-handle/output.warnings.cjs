module.exports = [
    new SyntaxError(`The grid option "suppressCopyRowsToClipboard" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |       suppressCopyRowsToClipboard={true}
  |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
    new SyntaxError(`The grid option "suppressCopySingleCellRanges" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |       suppressCopySingleCellRanges={true}
  |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
];
