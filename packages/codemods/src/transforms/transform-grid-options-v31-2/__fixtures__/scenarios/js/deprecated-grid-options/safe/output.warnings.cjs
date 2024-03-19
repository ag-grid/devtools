module.exports = [
  new SyntaxError(`The grid option "enableCellChangeFlash" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31-2/

> |   enableCellChangeFlash: true,
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
];
