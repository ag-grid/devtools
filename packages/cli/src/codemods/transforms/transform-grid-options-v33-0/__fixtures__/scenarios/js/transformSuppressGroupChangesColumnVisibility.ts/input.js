import { createGrid } from '@ag-grid-community/core';

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressRowGroupHidesColumns: true,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressRowGroupHidesColumns: false,
});

const opt1 = true;
createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressRowGroupHidesColumns: opt1,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressRowGroupHidesColumns: true ? false : false,
});


createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressMakeColumnVisibleAfterUnGroup: true,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressMakeColumnVisibleAfterUnGroup: false,
});

const opt2 = true;
createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressMakeColumnVisibleAfterUnGroup: opt2,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressMakeColumnVisibleAfterUnGroup: true ? false : false,
});


createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressRowGroupHidesColumns: true,
  suppressMakeColumnVisibleAfterUnGroup: true,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressRowGroupHidesColumns: true,
  suppressMakeColumnVisibleAfterUnGroup: false,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressRowGroupHidesColumns: false,
  suppressMakeColumnVisibleAfterUnGroup: true,
});
