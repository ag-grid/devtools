import { AgGridReact } from '@ag-grid-community/react';

const suppressMultiRangeSelection = true;
const suppressClearOnFillReduction = true;

function onRangeSelectionChanged() {}

function foo() {}

function MyComponent(props) {
  return (
    (<AgGridReact
        columnDefs={[]}
        rowData={[]}
        onCellSelectionChanged={onRangeSelectionChanged}
        onCellSelectionDeleteStart={foo}
        onCellSelectionDeleteEnd={() => {}}
        cellSelection={true}
        suppressMultiRangeSelection={suppressMultiRangeSelection}
        suppressClearOnFillReduction={suppressClearOnFillReduction}
        enableFillHandle={true}
        fillHandleDirection={'x'}
        fillOperation={() => {console.log('filling')}}
        suppressCopyRowsToClipboard={true}
        suppressCopySingleCellRanges={true}
      />)
  );
}
