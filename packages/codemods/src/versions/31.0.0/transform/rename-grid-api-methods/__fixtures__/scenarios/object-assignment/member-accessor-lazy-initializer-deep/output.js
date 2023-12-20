/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const ui = {};
ui.grids = {};

ui.grids.left = createGrid(document.getElementById('left'), {}),
ui.grids.right = createGrid(document.getElementById('right'), {}),

ui.grids.left.setGridOption("serverSideDatasource", value);
ui.grids.right.setGridOption("serverSideDatasource", value);
