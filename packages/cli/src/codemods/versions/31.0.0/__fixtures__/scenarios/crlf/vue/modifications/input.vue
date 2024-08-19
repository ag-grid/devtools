<script>
import { AgGridVue } from '@ag-grid-community/vue';

export default {
  components: {
    'ag-grid-vue': AgGridVue,
  },
  data() {
    return {
      columnDefs: [],
      rowData: [],
      advancedFilterModel: {
        filterType: 'join',
        type: 'AND',
        conditions: [],
      },
    };
  },
};
</script>

<template>
  <div>
    <ag-grid-vue
      :columnDefs="columnDefs"
      :rowData="rowData"
      :advancedFilterModel="advancedFilterModel"
    ></ag-grid-vue>
  </div>
</template>
