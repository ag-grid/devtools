<template>
  <div>
    <button v-on:click="onBtReset()">Reset column state</button>
    <ag-grid-vue
      :columnDefs="columnDefs"
      :rowData="rowData"
      @grid-ready="onGridReady"
    ></ag-grid-vue>
  </div>
</template>

<script lang="ts">
import { AgGridVue } from '@ag-grid-community/vue';

export interface MyInterfaceToTestTsParser {}

export default {
  components: {
    'ag-grid-vue': AgGridVue,
  },
  data() {
    return {
      columnDefs: [],
      columnApi: null,
      rowData: null,
    };
  },
  methods: {
    onBtReset() {
      this.columnApi.resetColumnState();
    },
    onGridReady(params) {
      this.columnApi = params.columnApi;

      fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((resp) => resp.json())
        .then((data) => {
          this.rowData = data;
          this.onBtReset();
        });
    },
  },
};
</script>
