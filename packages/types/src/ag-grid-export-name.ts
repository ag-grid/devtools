enum agGridKnownExportNames {
  // Add here more members here if you add more codemods based on new exports

  /** Old Grid constructor */
  Grid,

  /** New createGrid factory function */
  createGrid,

  /** ag-grid React component */
  AgGridReact,

  /** ag-grid Angular component */
  AgGridAngular,

  /** ag-grid Vue component */
  AgGridVue,
}

enum knownOtherExportNames {
  /** From angular component */
  Component,

  /** From angular core */
  ViewChild,
}

/**
 * The list of all known names exported by ag-grid used in various codemods.
 */
export type AgGridExportName = keyof typeof agGridKnownExportNames;

export type KnownExportName = AgGridExportName | keyof typeof knownOtherExportNames;

export const AgGridExportNames: Record<AgGridExportName, AgGridExportName> = Object.keys(
  agGridKnownExportNames,
).reduce((acc, key) => {
  if (isNaN(Number(key))) {
    acc[key] = key as AgGridExportName;
  }
  return acc;
}, Object.create(null));

export const isAgGridExportName = (name: unknown): name is AgGridExportName => {
  return typeof name === 'string' && name in AgGridExportNames;
};
