import { createGrid } from '@ag-grid-community/core';

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  unSortIcon: true,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  unSortIcon: false,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultColDef: {},
  unSortIcon: true,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultColDef: {},
  unSortIcon: false,
});

createGrid(document.body, {
  columnDefs: [
    { field: 'y', unSortIcon: false },
    { field: 'z' },
  ],
  rowData: [],
  defaultColDef: {
    field: 'a',
    unSortIcon: false,
  },
  unSortIcon: true,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultColDef: {
    field: 'a',
    unSortIcon: true,
  },
  unSortIcon: false,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultColDef: {
    field: 'a',
    unSortIcon: false,
  },
  unSortIcon: true,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultColDef: {
    field: 'a',
    unSortIcon: true,
  },
  unSortIcon: false,
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  sortingOrder: ['asc', 'desc'],
});


createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultColDef: {
    sortingOrder: ['asc', 'desc'],
  },
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultColDef: {},
  sortingOrder: ['asc', 'desc'],
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultColDef: {
    sortingOrder: ['asc', 'desc'],
  },
  sortingOrder: ['asc', 'desc'],
});
