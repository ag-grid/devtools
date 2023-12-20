/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const grids = {
  left: createGrid(document.getElementById('left'), {}),
  right: createGrid(document.getElementById('right'), {}),
};

const { left: leftGrid, right: rightGrid } = grids;

leftGrid.setServerSideDatasource(value);
rightGrid.setServerSideDatasource(value);
