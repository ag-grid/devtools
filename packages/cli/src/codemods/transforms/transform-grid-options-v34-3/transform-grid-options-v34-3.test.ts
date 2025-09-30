import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, onTestFinished, test } from 'vitest';
import { loadTransformScenarios } from '../../test/runners/transform';

import transformGridOptionsV34_3 from './transform-grid-options-v34-3';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(transformGridOptionsV34_3, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadTransformScenarios(scenariosPath, {
    transforms: [transformGridOptionsV34_3],
    vitest: { describe, expect, test, onTestFinished },
  });
});
