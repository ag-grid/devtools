<template>
  <div>
    <ag-grid-vue
      :columnDefs="[[{field: 'test', cellRenderer: 'agSparklineRenderer', cellRendererParams: {sparklineOptions: {type: 'column'}}}]"
      :rowData="rowData"
      @grid-ready="onGridReady"
    ></ag-grid-vue>
    <ag-grid-vue
      :columnDefs="columnDefs"
      :rowData="rowData"
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
      columnDefs: [{field: 'test', cellRenderer: 'agSparklineRenderer', cellRendererParams: {sparklineOptions: {
        type: 'bar',
        direction: 'vertical'
      }}}],
      rowData: [],
    };
  },
  methods: {
    onGridReady(params) {
    },
  },
};
</script>
