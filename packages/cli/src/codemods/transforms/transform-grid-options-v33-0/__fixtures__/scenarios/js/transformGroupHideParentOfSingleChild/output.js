import { createGrid } from '@ag-grid-community/core';

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupHideParentOfSingleChild: true,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupHideParentOfSingleChild: false,
});

const opt1 = true;
createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupHideParentOfSingleChild: opt1,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupHideParentOfSingleChild: true ? false : false,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupHideParentOfSingleChild: 'leafGroupsOnly',
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupHideParentOfSingleChild: false,
});

const opt2 = true;
createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupHideParentOfSingleChild: opt2 ? 'leafGroupsOnly' : false,
});

const opt3 = true;
const opt4 = true;
createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  groupHideParentOfSingleChild: opt3 || (opt4 ? 'leafGroupsOnly' : false)
});