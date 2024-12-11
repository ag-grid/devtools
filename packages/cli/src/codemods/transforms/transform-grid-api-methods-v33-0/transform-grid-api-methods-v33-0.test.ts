import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, onTestFinished, test } from 'vitest';
import { loadTransformScenarios } from '../../test/runners/transform';

import transformGridApiMethodsV33_0 from './transform-grid-api-methods-v33-0';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(transformGridApiMethodsV33_0, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadTransformScenarios(scenariosPath, {
    transforms: [transformGridApiMethodsV33_0],
    vitest: { describe, expect, test, onTestFinished },
  });
});
