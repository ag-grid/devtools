module.exports = [
  new SyntaxError(`The grid option "advancedFilterModel" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/
  1 | import { AgGridVue } from '@ag-grid-community/vue';
  2 |
> 3 | export default {
    | ^
  4 |   components: {
  5 |     'ag-grid-vue': AgGridVue,
  6 |   },`),
];
