import { type VersionManifest } from '@ag-grid-devtools/types';

import migrateLegacyColumnApiV31 from '../../transforms/migrate-legacy-column-api-v31/manifest';
import migrateLegacyJsGridConstructorV31 from '../../transforms/migrate-legacy-js-grid-constructor-v31/manifest';
import renameGridApiMethodsV31 from '../../transforms/transform-grid-api-methods-v31/manifest';
import renameGridOptionsV31 from '../../transforms/transform-grid-options-v31/manifest';

const manifest: VersionManifest = {
  version: '31.0.0',
  codemodPath: 'version/31.0.0/codemod.cjs',
  workerPath: 'version/31.0.0/worker.cjs',
  transforms: [
    migrateLegacyJsGridConstructorV31,
    migrateLegacyColumnApiV31,
    renameGridApiMethodsV31,
    renameGridOptionsV31,
  ],
};

export default manifest;
