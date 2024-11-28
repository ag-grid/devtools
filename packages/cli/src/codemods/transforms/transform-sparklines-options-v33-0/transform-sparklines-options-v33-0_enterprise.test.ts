import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  onTestFinished,
  test,
} from 'vitest';
import { loadTransformScenarios } from '../../test/runners/transform';

import transformSparklinesOptionsV33_0 from './transform-sparklines-options-v33-0';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(transformSparklinesOptionsV33_0, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');

  beforeEach(() => {
    process.env.AG_PREFER_ENTERPRISE_IMPORTS = 'true';
  });

  afterEach(() => {
    delete process.env.AG_PREFER_ENTERPRISE_IMPORTS;
  });

  loadTransformScenarios(scenariosPath, {
    transforms: [transformSparklinesOptionsV33_0],
    vitest: { describe, expect, test, onTestFinished },
    test: (name) => name.includes('enterprise'),
  });
});
