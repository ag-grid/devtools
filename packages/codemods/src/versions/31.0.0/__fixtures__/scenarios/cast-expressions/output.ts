// @ts-nocheck
import { GridOptions, createGrid } from 'ag-grid-community';
const options = <GridOptions>{ foo: true };
const optionsApi = createGrid(document.body, options);
