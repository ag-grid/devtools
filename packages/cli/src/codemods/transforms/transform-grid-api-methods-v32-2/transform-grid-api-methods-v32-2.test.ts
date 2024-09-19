import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, onTestFinished, test } from 'vitest';
import { loadTransformScenarios } from '../../test/runners/transform';

import transformGridApiMethodsV32_2 from './transform-grid-api-methods-v32-2';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(transformGridApiMethodsV32_2, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadTransformScenarios(scenariosPath, {
    transforms: [transformGridApiMethodsV32_2],
    vitest: { describe, expect, test, onTestFinished },
  });
});
