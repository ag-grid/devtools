/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const grids = {};

grids.left = createGrid(document.getElementById('left'), {}),
grids.right = createGrid(document.getElementById('right'), {}),

grids.left.setGridOption("serverSideDatasource", value);
grids.right.setGridOption("serverSideDatasource", value);
