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
   * Custom interceptor to check if a module is a grid module.
   * @param args - The input to check.
   * @returns `true` if the module is a grid module to process or not.
   * @returns true if the module is a custom grid module.
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
   * @returns true if the export is a custom grid module export.
   */
  isGridModuleExport?(args: IsGridModuleExportArgs): boolean;

  /**
   * Custom interceptor to provide a different name to the function to create a grid.
   * Default is "createGrid".
   *
   * This is used when fixing the old style Grid constructor with the new 'createGrid' function.
   *
   * Usually, this is the usage of createGrid:
   *
   * ```ts
   * import { myCreateGrid } from 'my-library';
   * const optionsApi = myCreateGrid(document.body, { ... });
   * ```
   *
   * A typical implementation would be:
   *
   * ```ts
   * getCreateGridName: () => 'myCreateGrid'
   * ```
   *
   * @returns The name of the function to create a grid. If this function returns null, undefined or empty string, "createGrid" will be used.
   *
   */
  getCreateGridName?(args: IsGridModuleExportArgs): string | null | undefined;
}
