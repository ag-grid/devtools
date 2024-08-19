import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  return (
    <div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        enableChartToolPanelsButton={{ foo: true }.foo}
      />
    </div>
  );
}
