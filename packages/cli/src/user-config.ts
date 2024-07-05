import type {
  UserConfig,
  Framework,
  ImportType,
  MatchGridImportArgs,
  MatchGridImportNameArgs,
  AgGridExportedName,
} from '@ag-grid-devtools/types';

export {
  UserConfig,
  Framework,
  ImportType,
  MatchGridImportArgs,
  MatchGridImportNameArgs,
  AgGridExportedName,
};

/**
 *
 * Define a user configuration for the AG Grid CLI migrate command.
 *
 * @example
 *
 * my-user-config.cjs
 *
 * ```js
 * module.export = defineUserConfig({
 *  matchGridImport({ importPath }) {
 *   return importPath === '@my-org/my-grid';
 *  }
 * });
 *
 * ```sh
 * ag-grid-cli migrate --config=./my-user-config.cjs
 * ```
 *
 *
 * @param config - The user configuration to define.
 * @returns The user configuration.
 */
export const defineUserConfig = (config: UserConfig): UserConfig => config;
