module.exports = [
    new SyntaxError(`The grid option "checkboxSelection" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |     checkboxSelection: true,
  |     ^^^^^^^^^^^^^^^^^^^^^^^`),
    new SyntaxError(`The grid option "headerCheckboxSelection" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |     headerCheckboxSelection: true,
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "headerCheckboxSelectionFilteredOnly" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |     headerCheckboxSelectionFilteredOnly: true,
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "checkboxSelection" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |     checkboxSelection: () => false,
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
    new SyntaxError(`The grid option "headerCheckboxSelection" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |     headerCheckboxSelection: true,
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`The grid option "headerCheckboxSelectionCurrentPageOnly" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-32-2/

> |     headerCheckboxSelectionCurrentPageOnly: true,
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
];
