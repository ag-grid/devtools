import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {  
  const [selectionState, setSelectionState] = useState("single");

  return (
    <AgGridReact 
      columnDefs={[]} 
      rowData={[]} 

      rowSelection={selectionState}

      onRangeSelectionChanged={() => {}}
      onRangeDeleteStart={() => {}}
      onRangeDeleteEnd={() => {}}

      suppressRowClickSelection
      suppressRowDeselection
      isRowSelectable={(params) => params.data.year < 2007}

      suppressCopyRowsToClipboard
      suppressCopySingleCellRanges
    />
  );
}
