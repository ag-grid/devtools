import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, onTestFinished, test } from 'vitest';
import { loadCodemodExampleScenarios } from '../../test/runners/codemod';

import codemod from './codemod';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(codemod, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadCodemodExampleScenarios(scenariosPath, {
    codemod,
    vitest: { describe, expect, test, onTestFinished },
  });
});
