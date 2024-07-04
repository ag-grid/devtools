export type FrameworkType = 'angular' | 'react' | 'vue' | 'vanilla';

export type ModuleType = 'esm' | 'cjs' | 'umd';

export interface IsGridModuleArgs {
  /** The module path being imported, as specified in the source code. For example "@my-company/my-grid" */
  importedModule: string;

  /** The framework (vanilla, react, angular, vue) */
  framework: FrameworkType;

  /** The type of module being imported (esm, cjs, umd) */
  moduleType: ModuleType;

  /** The filename of the source file being processed. For example "/my-org/my-project/myfile.tsx" */
  filename: string;
}

export interface IsGridModuleExportArgs {
  /** The imported module details, originally passed to isGridModule callback */
  module: IsGridModuleArgs;

  /** The match to find, for example "AgGridReact" */
  match: string;

  /** The export name, for example 'MyGrid' */
  exported: string;
}

export interface UserConfig {
  /**
   * The name of the function to create a grid. Default is "createGrid".
   *
   * Usually, this is the usage of createGrid:
   *
   * ```ts
   * import { createGrid } from '@ag-grid-community/core';
   * const optionsApi = createGrid(document.body, { ... });
   * ```
   *
   */
  createGridName?: string;

  /**
   * Custom interceptor to check if a module is a grid module.
   * @param args - The input to check.
   * @returns `true` if the module is a grid module to process or not.
   */
  isGridModule?(args: IsGridModuleArgs): boolean;

  /**
   * Custom interceptor to check if a module is a grid module export.
   * This is called only if isGridModule was specified and returned `true`.
   * For example, AgGridReact is a grid module export from '@ag-grid-react/react'.
   *
   * A default implementation would be:
   *
   * ```ts
   * isGridModuleExport: ({ match, exported }) => {
   *  return exported === match; // Match the export name with the expected match.
   * }
   * ```
   *
   * @param args - The input to check.
   */
  isGridModuleExport?(args: IsGridModuleExportArgs): boolean;
}
