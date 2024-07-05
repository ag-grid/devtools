const agGridKnownExportNames = {
  // Add here more members here if you add more codemods based on new exports

  /** Old Grid constructor */
  Grid: 0,

  /** New createGrid factory function */
  createGrid: 0,

  /** ag-grid React component */
  AgGridReact: 0,

  /** ag-grid Angular component */
  AgGridAngular: 0,

  /** ag-grid Vue component */
  AgGridVue: 0,
};

const knownExportNames = {
  /** From angular component */
  Component: 0,

  /** From angular core */
  ViewChild: 0,

  ...agGridKnownExportNames,
};

/**
 * The list of all known names exported by ag-grid used in various codemods.
 */
export type AgGridExportName = keyof typeof agGridKnownExportNames;

export type KnownExportName = keyof typeof knownExportNames;

export const AgGridExportName: Readonly<Record<AgGridExportName, AgGridExportName>> = Object.keys(
  knownExportNames,
).reduce((acc, key) => {
  acc[key as AgGridExportName] = key as AgGridExportName;
  return acc;
}, Object.create(null));

export const isAgGridExportName = (name: string): name is AgGridExportName => {
  return name in agGridKnownExportNames;
};
