/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const grids = {
  left: createGrid(document.getElementById('left'), {}),
  right: createGrid(document.getElementById('right'), {}),
};

const { left: leftGrid, right: rightGrid } = grids;

leftGrid.setGridOption("serverSideDatasource", value);
rightGrid.setGridOption("serverSideDatasource", value);
