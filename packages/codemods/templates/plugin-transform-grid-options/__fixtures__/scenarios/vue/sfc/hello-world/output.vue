<template>
  <div>
    <ag-grid-vue
      :columnDefs="columnDefs"
      :rowData="rowData"
      :greet="user"
      
      :unfriendly="false"
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
      user: 'world',
    };
  },
  methods: {
    onGridReady(params) {
      this.user = 'world';
    },
  },
};
</script>
