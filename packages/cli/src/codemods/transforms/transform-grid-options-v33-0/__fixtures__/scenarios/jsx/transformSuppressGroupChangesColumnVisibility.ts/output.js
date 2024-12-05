function GridComponent (props) {
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressGroupChangesColumnVisibility="suppressHideOnGroup"
    />)
  );
}

function GridComponent2() {
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressGroupChangesColumnVisibility="suppressHideOnGroup"
    />)
  );
}

function GridComponent3() {
  return (<AgGridReact columnDefs={[]} rowData={[]}  />);
}

function GridComponent4() {
  const opt1 = true;
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressGroupChangesColumnVisibility={opt1 ? "suppressHideOnGroup" : false}
    />)
  );
}

function GridComponent5() {
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressGroupChangesColumnVisibility={(true ? false : false) ? "suppressHideOnGroup" : false}
    />)
  );
}

function GridComponent6() {
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressGroupChangesColumnVisibility="suppressShowOnUngroup"
    />)
  );
}

function GridComponent7() {
  return (<AgGridReact columnDefs={[]} rowData={[]}  />);
}

function GridComponent8() {
  const opt2 = true;
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressGroupChangesColumnVisibility={opt2 ? "suppressShowOnUngroup" : false}
    />)
  );
}

function GridComponent9() {
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressGroupChangesColumnVisibility={(true ? false : false) ? "suppressShowOnUngroup" : false}
    />)
  );
}

function GridComponent10() {
  return (<AgGridReact columnDefs={[]} rowData={[]} suppressGroupChangesColumnVisibility />);
}

function GridComponent11() {
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      suppressGroupChangesColumnVisibility="suppressHideOnGroup" />)
  );
}

function GridComponent12() {
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}

      suppressGroupChangesColumnVisibility="suppressShowOnUngroup" />)
  );
}
