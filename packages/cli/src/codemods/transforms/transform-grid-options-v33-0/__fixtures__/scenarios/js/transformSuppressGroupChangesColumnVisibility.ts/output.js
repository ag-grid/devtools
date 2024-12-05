import { createGrid } from '@ag-grid-community/core';

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressGroupChangesColumnVisibility: 'suppressHideOnGroup',
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],

});

const opt1 = true;
createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressGroupChangesColumnVisibility: opt1 ? 'suppressHideOnGroup' : false,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressGroupChangesColumnVisibility: (true ? false : false) ? 'suppressHideOnGroup' : false,
});


createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressGroupChangesColumnVisibility: 'suppressShowOnUngroup',
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],

});

const opt2 = true;
createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressGroupChangesColumnVisibility: opt2 ? 'suppressShowOnUngroup' : false,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressGroupChangesColumnVisibility: (true ? false : false) ? 'suppressShowOnUngroup' : false,
});


createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressGroupChangesColumnVisibility: true
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressGroupChangesColumnVisibility: 'suppressHideOnGroup'
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
,
  suppressGroupChangesColumnVisibility: 'suppressShowOnUngroup'
});
