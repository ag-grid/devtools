import { AgGridExportName as AgGridExportName } from './ag-grid-export-name';

export type Framework = 'angular' | 'react' | 'vue' | 'vanilla';

export type ImportType = 'esm' | 'cjs' | 'umd';

export interface MatchGridImportArgs {
  /** The path being imported, as specified in the source code. For example `import "@my-company/my-grid"` */
  importPath: string;

  /** The type of module being imported (esm, cjs, umd) */
  importType: ImportType;

  /**
   * The framework being matched (vanilla, react, angular, vue).
   * - "angular" for `@ag-grid-community/angular` or `ag-grid-angular`
   * - "vanilla" for `@ag-grid-community/core` or `ag-grid-community`
   * - "react" for `@ag-grid-community/react` or `ag-grid-react`
   * - "vue" for `@ag-grid-community/vue` or `ag-grid-vue`
   */
  framework: Framework;

  /** The filename of the source file being processed. For example "/my-org/my-project/myfile.tsx" */
  sourceFilePath: string;
}

export interface MatchGridImportNameArgs extends MatchGridImportArgs {
  /** The match to check, for example "AgGridReact" */
  agGridExportName: AgGridExportName;

  /** The imported symbol, for example "MyGrid" */
  importName: string;
}

export interface UserConfig {
  /**
   * Custom interceptor to check if an import is a grid module.
   *
   * Return true to process the received module import path as an AG Grid module.
   *
   * Note that this interceptor will not be called for AG Grid modules, they will be processed by default.
   *
   * @example
   *
   * ```ts
   * matchGridImport({ importPath }) {
   *   return importPath === "@my-org/my-grid";
   * }
   * ```
   *
   * @param args - The input to check.
   * @returns true if the received input matches one custom module to process.
   */
  matchGridImport?(args: MatchGridImportArgs): boolean;

  /**
   * Custom interceptor to check if a module is a grid module export.
   * This may be called only if matchGridImport was specified and returned `true`.
   *
   * This interceptor can be used to handle reexported grid symbols with a different name.
   *
   * For example, if AgGridReact coming from "@ag-grid-community/react" has been reexported as "MyGrid" from "@my-org/my-grid", this interceptor can be used to match it.
   *
   * ```ts
   * matchGridImport({ importPath }) {
   *   return importPath === "@my-org/my-grid";
   * },
   *
   * matchGridImportName: ({ agGridExportName, importName, importPath }) => {
   *  if (importPath === "@my-org/my-grid" && agGridExportName === "AgGridReact" && importName === "MyGrid") {
   *    return true;
   *  }
   *  return agGridExportName === importName; // Default matching, for example "createGrid" will be matched with "createGrid".
   * }
   * ```
   *
   * A default implementation would be:
   *
   * ```ts
   * matchGridImportName: ({ agGridExportName, importName }) => {
   *  return agGridExportName === importName; // Match the export name with the expected default match.
   * }
   * ```
   *
   * Note that this interceptor will not be called for AG Grid modules, they will be processed by default.
   *
   * @param args - The input to check.
   * @returns true if the export is a custom grid module export.
   */
  matchGridImportName?(args: MatchGridImportNameArgs): boolean;

  /**
   * In vanilla JavaScript, the Grid constructor was deprecated and replaced by the `createGrid` function.
   * This interceptor will be called to replace "new MyGrid(...)" with "createMyGrid(...)".
   *
   * Usually, this is the usage of createGrid:
   *
   * Note that this interceptor will not be called for AG Grid modules, they will be processed by default.
   *
   * @returns The name of the function to create a grid. If this function returns null, undefined or empty string, "createGrid" will be used.
   *
   */
  getCreateGridName?(args: MatchGridImportNameArgs): string | null | undefined;
}
