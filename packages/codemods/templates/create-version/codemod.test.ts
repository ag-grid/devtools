import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe } from 'vitest';
import { loadCodemodExampleScenarios } from '../../__fixtures__/runners/codemod';

import codemod from './codemod';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(codemod, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadCodemodExampleScenarios(scenariosPath, {
    codemod,
  });
});
