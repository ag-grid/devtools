import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe } from 'vitest';
import { loadTransformScenarios } from '../../__fixtures__/runners/transform';

import transformGridApiMethodsV31 from './transform-grid-api-methods-v31';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(transformGridApiMethodsV31, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadTransformScenarios(scenariosPath, {
    transforms: [transformGridApiMethodsV31],
  });
});
