import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, onTestFinished, test } from 'vitest';
import { loadTransformScenarios } from '../../test/runners/transform';

import transformModulesToPackagesV33 from './transform-modules-to-packages-v33';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(transformModulesToPackagesV33, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');

  beforeEach(() => {
    process.env.AG_USING_CHARTS = 'enterprise';
  });

  afterEach(() => {
    delete process.env.AG_USING_CHARTS;
  });

  loadTransformScenarios(scenariosPath, {
    transforms: [transformModulesToPackagesV33],
    vitest: { describe, expect, test, onTestFinished },
    test: (name) => {
      return name.includes('ENTERPRISE');
    },
  });
});
