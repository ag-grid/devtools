/* eslint-disable */
import { AgGridVue } from '@ag-grid-community/vue';

const AppComponent = {
  template: `
    <div>
      <ag-grid-vue
        :columnDefs="columnDefs"
        :rowData="rowData"
        :hello="user"
        :goodbye="user"
        :friendly="true"
        @grid-ready="onGridReady"
      ></ag-grid-vue>
    </div>
  `,
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
