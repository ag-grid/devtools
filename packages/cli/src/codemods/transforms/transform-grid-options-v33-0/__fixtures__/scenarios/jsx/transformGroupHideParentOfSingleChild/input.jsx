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

function MyComponent4 (props) {
  const [groupRemoveSingleChildren, setGroupRemoveSingleChildren] = useState(true);
  return (
    <AgGridReact
      groupRemoveSingleChildren={groupRemoveSingleChildren}
    />
  )
}

function MyComponent5 (props) {
  return (
    <AgGridReact
      groupRemoveLowestSingleChildren
    />
  )
}

function MyComponent6 (props) {
  return (
    <AgGridReact
      groupRemoveLowestSingleChildren={true}
    />
  )
}

function MyComponent7 (props) {
  return (
    <AgGridReact
      groupRemoveLowestSingleChildren={false}
    />
  )
}

function MyComponent8 (props) {
  const [groupRemoveLowestSingleChildren, setGroupRemoveLowestSingleChildren] = useState(true);
  return (
    <AgGridReact
      groupRemoveLowestSingleChildren={groupRemoveLowestSingleChildren}
    />
  )
}

function MyComponent9 (props) {
  const [groupRemoveLowestSingleChildren, setGroupRemoveLowestSingleChildren] = useState(true);
  return (
    <AgGridReact
      groupRemoveSingleChildren
      groupRemoveLowestSingleChildren={groupRemoveLowestSingleChildren}
    />
  )
}

function MyComponent10 (props) {
  const [groupRemoveLowestSingleChildren, setGroupRemoveLowestSingleChildren] = useState(true);
  return (
    <AgGridReact
      groupRemoveSingleChildren={false}
      groupRemoveLowestSingleChildren={groupRemoveLowestSingleChildren}
    />
  )
}