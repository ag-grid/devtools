/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const ui = {};
ui.grids = {};

ui.grids.left = createGrid(document.getElementById('left'), {}),
ui.grids.right = createGrid(document.getElementById('right'), {}),

ui.grids.left.setServerSideDatasource(value);
ui.grids.right.setServerSideDatasource(value);
