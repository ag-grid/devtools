import { createGrid } from '@ag-grid-community/core';

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultColDef: {
    unSortIcon: true
  },
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultColDef: {
    unSortIcon: false
  },
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],

  defaultColDef: {
    unSortIcon: true
  }
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],

  defaultColDef: {
    unSortIcon: false
  }
});

createGrid(document.body, {
  columnDefs: [
    { field: 'y', unSortIcon: false },
    { field: 'z' },
  ],

  rowData: [],

  defaultColDef: {
    field: 'a',
    unSortIcon: true,
  }
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],

  defaultColDef: {
    field: 'a',
    unSortIcon: false,
  }
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],

  defaultColDef: {
    field: 'a',
    unSortIcon: true,
  }
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],

  defaultColDef: {
    field: 'a',
    unSortIcon: false,
  }
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultColDef: {
    sortingOrder: ['asc', 'desc']
  },
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

  defaultColDef: {
    sortingOrder: ['asc', 'desc']
  }
});

createGrid(document.body, {
  columnDefs: [],
  rowData: [],

  defaultColDef: {
    sortingOrder: ['asc', 'desc'],
  }
});
