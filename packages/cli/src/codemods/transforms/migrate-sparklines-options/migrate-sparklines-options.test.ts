import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, onTestFinished, test } from 'vitest';
import { loadTransformScenarios } from '../../test/runners/transform';

import migrateSparklinesOptions from './migrate-sparklines-options';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(migrateSparklinesOptions, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadTransformScenarios(scenariosPath, {
    transforms: [migrateSparklinesOptions],
    vitest: { describe, expect, test, onTestFinished },
  });
});
