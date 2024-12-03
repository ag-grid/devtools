import { AgGridReact } from '@ag-grid-community/react';

function MyComponent (props) {
  return (
    <AgGridReact
      groupHideParentOfSingleChild
    />
  )
}

function MyComponent2 (props) {
  return (
    <AgGridReact
      groupHideParentOfSingleChild={true}
    />
  )
}

function MyComponent3 (props) {
  return (
    <AgGridReact
      groupHideParentOfSingleChild={false}
    />
  )
}
