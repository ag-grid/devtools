import { AgGridVue } from '@ag-grid-community/vue';

const AppComponent = {
  template: `
    <div>
      <ag-grid-vue
        :columnDefs="columnDefs"
        :rowData="rowData"
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
      rowData: null,
    };
  },
  methods: {
    onGridReady({ api: columnApi }) {
      fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((resp) => resp.json())
        .then((data) => {
          this.rowData = data;
          columnApi.resetColumnState();
        });
    },
  },
};
