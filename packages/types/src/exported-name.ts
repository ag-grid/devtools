const agGridKnownExportedNames = {
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

const knownExportedNames = {
  /** From angular component */
  Component: 0,

  /** From angular core */
  ViewChild: 0,

  ...agGridKnownExportedNames,
};

/**
 * The list of all known names exported by ag-grid used in various codemods.
 */
export type AgGridExportedName = keyof typeof agGridKnownExportedNames;

export type KnownExportedName = keyof typeof knownExportedNames;

export const AgGridExportedName: Readonly<Record<AgGridExportedName, AgGridExportedName>> =
  Object.keys(knownExportedNames).reduce((acc, key) => {
    acc[key as AgGridExportedName] = key as AgGridExportedName;
    return acc;
  }, Object.create(null));

export const isAgGridExportedName = (name: string): name is AgGridExportedName => {
  return name in agGridKnownExportedNames;
};
