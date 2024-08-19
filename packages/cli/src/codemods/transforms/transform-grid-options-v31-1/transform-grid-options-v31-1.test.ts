import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, onTestFinished, test } from 'vitest';
import { loadTransformScenarios } from '../../test/runners/transform';

import transformGridOptionsV31_1 from './transform-grid-options-v31-1';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(transformGridOptionsV31_1, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadTransformScenarios(scenariosPath, {
    transforms: [transformGridOptionsV31_1],
    vitest: { describe, expect, test, onTestFinished },
  });
});
