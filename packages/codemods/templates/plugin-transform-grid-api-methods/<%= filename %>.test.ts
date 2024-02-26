import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe } from 'vitest';
import { loadTransformScenarios } from '../../test/runners/transform';

import <%= identifier %> from './<%= filename %>';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(<%= identifier %>, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  loadTransformScenarios(scenariosPath, {
    transforms: [<%= identifier %>],
  });
});
