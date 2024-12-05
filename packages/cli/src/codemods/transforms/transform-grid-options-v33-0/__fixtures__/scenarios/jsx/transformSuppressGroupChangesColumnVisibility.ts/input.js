function GridComponent (props) {
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressRowGroupHidesColumns
    />
  )
}

function GridComponent2() {
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressRowGroupHidesColumns={true}
    />
  );
}

function GridComponent3() {
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressRowGroupHidesColumns={false}
    />
  );
}

function GridComponent4() {
  const opt1 = true;
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressRowGroupHidesColumns={opt1}
    />
  );
}

function GridComponent5() {
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressRowGroupHidesColumns={true ? false : false}
    />
  );
}

function GridComponent6() {
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressMakeColumnVisibleAfterUnGroup={true}
    />
  );
}

function GridComponent7() {
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressMakeColumnVisibleAfterUnGroup={false}
    />
  );
}

function GridComponent8() {
  const opt2 = true;
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressMakeColumnVisibleAfterUnGroup={opt2}
    />
  );
}

function GridComponent9() {
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressMakeColumnVisibleAfterUnGroup={true ? false : false}
    />
  );
}

function GridComponent10() {
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressRowGroupHidesColumns={true}
      suppressMakeColumnVisibleAfterUnGroup={true}
    />
  );
}

function GridComponent11() {
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressRowGroupHidesColumns={true}
      suppressMakeColumnVisibleAfterUnGroup={false}
    />
  );
}

function GridComponent12() {
  return (
    <AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressRowGroupHidesColumns={false}
      suppressMakeColumnVisibleAfterUnGroup={true}
    />
  );
}
