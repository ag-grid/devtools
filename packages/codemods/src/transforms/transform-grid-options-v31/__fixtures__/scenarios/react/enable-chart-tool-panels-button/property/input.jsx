/* eslint-disable */
import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  const enableChartToolPanelsButton = true;
  return (
    <div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        enableChartToolPanelsButton={enableChartToolPanelsButton}
      />
    </div>
  );
}
