module.exports = [
  new SyntaxError(`The grid option "rowDataChangeDetectionStrategy" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
  5 |   columnDefs: [],
  6 |   rowData: [],
> 7 |   rowDataChangeDetectionStrategy: 'DeepEqualityCheck',
    |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  8 | });
  9 |`),
];
