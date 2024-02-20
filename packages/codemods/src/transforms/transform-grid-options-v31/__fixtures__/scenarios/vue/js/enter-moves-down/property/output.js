/* eslint-disable */
import { AgGridVue } from '@ag-grid-community/vue';

const AppComponent = {
  template: `
    <div>
      <ag-grid-vue
        :columnDefs="columnDefs"
        :rowData="rowData"
        :enterNavigatesVertically="enterMovesDown"
        :enterNavigatesVerticallyAfterEdit="enterMovesDownAfterEdit"
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
      enterMovesDown: true,
      enterMovesDownAfterEdit: true,
    };
  },
  methods: {
    onGridReady(params) {
      this.enterMovesDown = true;
      this.enterMovesDownAfterEdit = true;
    },
  },
};
