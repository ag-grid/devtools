import { ast } from '@ag-grid-devtools/ast';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, onTestFinished, test } from 'vitest';
import { loadBabelTransformExampleScenarios } from '../../test/runners/babel';

import { addModuleImports } from './add-module-imports';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe(addModuleImports, () => {
  const scenariosPath = join(__dirname, './__fixtures__/scenarios');
  const transform = addModuleImports([
    ast.statement`
      import { hello } from "world";
    `,
  ]);
  loadBabelTransformExampleScenarios(scenariosPath, {
    plugins: [transform],
    vitest: { describe, expect, test, onTestFinished },
  });
});
