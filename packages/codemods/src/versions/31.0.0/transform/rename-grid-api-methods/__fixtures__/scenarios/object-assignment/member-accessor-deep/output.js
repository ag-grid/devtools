/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const ui = {
  grids: {
    left: createGrid(document.getElementById('left'), {}),
    right: createGrid(document.getElementById('right'), {}),
  },
};

ui.grids.left.setGridOption("serverSideDatasource", value);
ui.grids.right.setGridOption("serverSideDatasource", value);
