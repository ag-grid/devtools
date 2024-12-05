import { AgGridReact } from '@ag-grid-community/react';

function MyComponent (props) {
  return (
    (<AgGridReact
      groupHideParentOfSingleChild
    />)
  );
}

function MyComponent2 (props) {
  return (
    (<AgGridReact
      groupHideParentOfSingleChild
    />)
  );
}

function MyComponent3 (props) {
  return (<AgGridReact  />);
}

function MyComponent4 (props) {
  const [groupRemoveSingleChildren, setGroupRemoveSingleChildren] = useState(true);
  return (
    (<AgGridReact
      groupHideParentOfSingleChild={groupRemoveSingleChildren}
    />)
  );
}

function MyComponent5 (props) {
  return (
    (<AgGridReact
      groupHideParentOfSingleChild='leafGroupsOnly'
    />)
  );
}

function MyComponent6 (props) {
  return (
    (<AgGridReact
      groupHideParentOfSingleChild='leafGroupsOnly'
    />)
  );
}

function MyComponent7 (props) {
  return (<AgGridReact  />);
}

function MyComponent8 (props) {
  const [groupRemoveLowestSingleChildren, setGroupRemoveLowestSingleChildren] = useState(true);
  return (
    (<AgGridReact
      groupHideParentOfSingleChild={groupRemoveLowestSingleChildren ? 'leafGroupsOnly' : false}
    />)
  );
}

function MyComponent9 (props) {
  const [groupRemoveLowestSingleChildren, setGroupRemoveLowestSingleChildren] = useState(true);
  return (<AgGridReact groupHideParentOfSingleChild />);
}

function MyComponent10 (props) {
  const [groupRemoveLowestSingleChildren, setGroupRemoveLowestSingleChildren] = useState(true);
  return (
    (<AgGridReact

      groupHideParentOfSingleChild={groupRemoveLowestSingleChildren ? 'leafGroupsOnly' : false} />)
  );
}