import { type TransformManifest, type VersionManifest } from '@ag-grid-devtools/types';

const transforms: Array<TransformManifest> = [];

const manifest: VersionManifest = {
  version: '<%= version %>',
  codemodPath: 'version/<%= version %>/codemod.cjs',
  transforms,
};

export default manifest;
