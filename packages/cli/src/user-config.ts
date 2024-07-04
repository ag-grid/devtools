import type {
  UserConfig,
  FrameworkType,
  ModuleType,
  IsGridModuleArgs,
  IsGridModuleExportArgs,
} from '@ag-grid-devtools/types';

export { UserConfig, FrameworkType, ModuleType, IsGridModuleArgs, IsGridModuleExportArgs };

export const defineUserConfig = (config: UserConfig): UserConfig => config;
