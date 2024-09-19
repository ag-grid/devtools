module.exports = [
    new SyntaxError(`The grid option "enableRangeSelection" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |   enableRangeSelection: cellSelection,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "enableRangeHandle" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |   enableRangeHandle: isEnableRangeHandle(),
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
    new SyntaxError(`The grid option "suppressCopyRowsToClipboard" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |   suppressCopyRowsToClipboard: true,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
    new SyntaxError(`The grid option "suppressCopySingleCellRanges" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |   suppressCopySingleCellRanges: true,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
];
