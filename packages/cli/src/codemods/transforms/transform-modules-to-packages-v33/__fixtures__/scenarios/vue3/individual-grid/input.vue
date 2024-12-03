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
import { AgGridVue } from '@ag-grid-community/vue3';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

export default {
  components: {
    'ag-grid-vue': AgGridVue,
  },
  data() {
    return {
      columnDefs: [],
      rowData: [],
      modules: [ClientSideRowModelModule],
    };
  },
  methods: {
    onGridReady(params) {
      console.log("Hello, world!");
    },
  },
};
</script>
