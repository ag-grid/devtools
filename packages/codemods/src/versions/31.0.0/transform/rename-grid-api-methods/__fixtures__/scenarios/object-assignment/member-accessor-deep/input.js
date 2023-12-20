/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const ui = {
  grids: {
    left: createGrid(document.getElementById('left'), {}),
    right: createGrid(document.getElementById('right'), {}),
  },
};

ui.grids.left.setServerSideDatasource(value);
ui.grids.right.setServerSideDatasource(value);
