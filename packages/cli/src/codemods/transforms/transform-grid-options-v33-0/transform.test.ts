import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, onTestFinished, test } from 'vitest';
import { loadTransformScenarios } from '../../test/runners/transform';

import transform from './transform';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(transform, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadTransformScenarios(scenariosPath, {
    transforms: [transform],
    vitest: { describe, expect, test, onTestFinished },
  });
});
