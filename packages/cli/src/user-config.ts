import type {
  UserConfig,
  FrameworkType,
  ModuleType,
  IsGridModuleArgs,
  IsGridModuleExportArgs,
  AgGridExportedName,
} from '@ag-grid-devtools/types';

export {
  UserConfig,
  FrameworkType,
  ModuleType,
  IsGridModuleArgs,
  IsGridModuleExportArgs,
  AgGridExportedName as KnownExportedName,
};

export const defineUserConfig = (config: UserConfig): UserConfig => config;
