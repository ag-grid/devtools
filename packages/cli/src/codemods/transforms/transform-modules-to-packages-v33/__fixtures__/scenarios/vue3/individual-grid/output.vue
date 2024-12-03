<template>
  <div>
    <ag-grid-vue
      :columnDefs="columnDefs"
      :rowData="rowData"
      @grid-ready="onGridReady"
      :modules="modules"
    ></ag-grid-vue>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';

import { AllCommunityModule, ClientSideRowModelModule } from 'ag-grid-community';

export default {
  components: {
    'ag-grid-vue': AgGridVue,
  },
  data() {
    return {
      columnDefs: [],
      rowData: [],
      modules: [AllCommunityModule, ClientSideRowModelModule],
    };
  },
  methods: {
    onGridReady(params) {
      console.log("Hello, world!");
    },
  },
};
</script>
