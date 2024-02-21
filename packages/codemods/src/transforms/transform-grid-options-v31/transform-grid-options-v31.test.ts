import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe } from 'vitest';
import { loadTransformScenarios } from '../../__fixtures__/runners/transform';

import transformGridOptionsV31 from './transform-grid-options-v31';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(transformGridOptionsV31, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadTransformScenarios(scenariosPath, {
    transforms: [transformGridOptionsV31],
  });
});
