import { createCodemodTask, initCodemodTaskWorker } from '@ag-grid-devtools/codemod-task-utils';
import { createFsHelpers } from '@ag-grid-devtools/worker-utils';

import codemod from './codemod';

const task = createCodemodTask(codemod);

initCodemodTaskWorker(task, {
  fs: createFsHelpers(),
});
