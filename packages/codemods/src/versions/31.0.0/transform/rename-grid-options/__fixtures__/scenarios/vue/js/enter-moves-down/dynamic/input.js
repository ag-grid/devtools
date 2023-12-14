/* eslint-disable */
import { AgGridVue } from '@ag-grid-community/vue';

const AppComponent = {
  template: `
    <div>
      <ag-grid-vue
        :columnDefs="columnDefs"
        :rowData="rowData"
        :enterMovesDown="{ foo: true }.foo"
        :enterMovesDownAfterEdit="{ foo: true }.foo"
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
      enableChartToolPanelsButton: true,
    };
  },
  methods: {
    onGridReady(params) {
      this.enableChartToolPanelsButton = true;
    },
  },
};
