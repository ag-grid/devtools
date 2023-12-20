/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const ui = {
  grids: {
    left: createGrid(document.getElementById('left'), {}),
    right: createGrid(document.getElementById('right'), {}),
  },
};

const { grids: gridInstances } = ui;

gridInstances.left.setGridOption("serverSideDatasource", value);
gridInstances.right.setGridOption("serverSideDatasource", value);
