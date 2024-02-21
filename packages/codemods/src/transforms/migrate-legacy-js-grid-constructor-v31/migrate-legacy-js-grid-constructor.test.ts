import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe } from 'vitest';
import { loadTransformScenarios } from '../../__fixtures__/runners/transform';

import migrateLegacyJsGridConstructor from './migrate-legacy-js-grid-constructor';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(migrateLegacyJsGridConstructor, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadTransformScenarios(scenariosPath, {
    transforms: [migrateLegacyJsGridConstructor],
  });
});
