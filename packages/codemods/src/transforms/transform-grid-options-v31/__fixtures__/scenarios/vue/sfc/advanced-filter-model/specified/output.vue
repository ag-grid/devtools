<template>
  <div>
    <ag-grid-vue
      :columnDefs="columnDefs"
      :rowData="rowData"
      :initialState="advancedFilterModel"
      @grid-ready="onGridReady"
    ></ag-grid-vue>
  </div>
</template>

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
  methods: {
    onGridReady(params) {
      this.advancedFilterModel = {
        filterType: 'join',
        type: 'AND',
        conditions: [],
      };
    },
  },
};
</script>
