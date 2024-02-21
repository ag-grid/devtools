import { createCodemodTask } from '@ag-grid-devtools/codemod-utils';
import { createFsHelpers, initCodemodTaskWorker } from '@ag-grid-devtools/worker-utils';

import codemod from './codemod';

const task = createCodemodTask(codemod);

initCodemodTaskWorker(task, {
  fs: createFsHelpers(),
});
