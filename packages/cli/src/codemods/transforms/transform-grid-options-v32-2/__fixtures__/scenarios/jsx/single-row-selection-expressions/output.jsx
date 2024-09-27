import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {  
  const [selectionState, setSelectionState] = useState("single");

  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      rowSelection={{
        isRowSelectable: (params) => params.data.year < 2007
      }}
      onCellSelectionChanged={() => {}}
      onCellSelectionDeleteStart={() => {}}
      onCellSelectionDeleteEnd={() => {}}
      suppressRowClickSelection
      suppressRowDeselection
      suppressCopyRowsToClipboard
      suppressCopySingleCellRanges />)
  );
}
