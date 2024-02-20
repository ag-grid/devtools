import { AstCliContext, AstTransform } from '@ag-grid-devtools/ast';

import migrateLegacyJsGridConstructor from '../../transforms/migrate-legacy-js-grid-constructor-v31';
import migrateLegacyColumnApi from '../../transforms/migrate-legacy-column-api-v31';
import transformGridApiMethodsV31 from '../../transforms/transform-grid-api-methods-v31';
import transformGridOptionsV31 from '../../transforms/transform-grid-options-v31';

const transforms: Array<AstTransform<AstCliContext>> = [
  migrateLegacyJsGridConstructor,
  migrateLegacyColumnApi,
  transformGridApiMethodsV31,
  transformGridOptionsV31,
];

export default transforms;
