/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const grids = {
  left: createGrid(document.getElementById('left'), {}),
  right: createGrid(document.getElementById('right'), {}),
};

grids.left.setGridOption("serverSideDatasource", value);
grids.right.setGridOption("serverSideDatasource", value);
