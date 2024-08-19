import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, onTestFinished, test } from 'vitest';
import { loadTransformScenarios } from '../../test/runners/transform';

import migrateLegacyColumnApi from './migrate-legacy-column-api-v31';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(migrateLegacyColumnApi, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadTransformScenarios(scenariosPath, {
    transforms: [migrateLegacyColumnApi],
    vitest: { describe, expect, test, onTestFinished },
  });
});
