/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const ui = {
  grids: {
    left: createGrid(document.getElementById('left'), {}),
    right: createGrid(document.getElementById('right'), {}),
  },
};

const { grids: gridInstances } = ui;

gridInstances.left.setServerSideDatasource(value);
gridInstances.right.setServerSideDatasource(value);
