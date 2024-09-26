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
      suppressCopyRowsToClipboard={true}
      suppressCopySingleCellRanges={true}
      cellSelection={{
        suppressMultiRanges: suppressMultiRangeSelection,

        handle: {
          suppressClearOnFillReduction: suppressClearOnFillReduction,
          mode: "fill",
          direction: 'x',
          setFillValue: () => {console.log('filling')}
        }
      }} />)
  );
}
