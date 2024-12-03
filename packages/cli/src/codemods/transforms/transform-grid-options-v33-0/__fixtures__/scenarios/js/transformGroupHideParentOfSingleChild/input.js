import { createGrid } from '@ag-grid-community/core';

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupRemoveSingleChildren: true,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupRemoveSingleChildren: false,
});

const opt1 = true;
createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupRemoveSingleChildren: opt1,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupRemoveSingleChildren: true ? false : false,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupRemoveLowestSingleChildren: true,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupRemoveLowestSingleChildren: false,
});

const opt2 = true;
createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupRemoveLowestSingleChildren: opt2,
});

const opt3 = true;
const opt4 = true;
createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupRemoveSingleChildren: opt3,
  groupRemoveLowestSingleChildren: opt4,
});