/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const ui = {
  grids: {
    left: createGrid(document.getElementById('left'), {}),
    right: createGrid(document.getElementById('right'), {}),
  },
};

const { grids: { left: leftGrid, right: rightGrid } } = ui;

leftGrid.setServerSideDatasource(value);
rightGrid.setServerSideDatasource(value);
