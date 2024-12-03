import { AgGridReact } from '@ag-grid-community/react';

function MyComponent (props) {
  return (
    <AgGridReact
      groupRemoveSingleChildren
    />
  )
}

function MyComponent2 (props) {
  return (
    <AgGridReact
      groupRemoveSingleChildren={true}
    />
  )
}

function MyComponent3 (props) {
  return (
    <AgGridReact
      groupRemoveSingleChildren={false}
    />
  )
}
