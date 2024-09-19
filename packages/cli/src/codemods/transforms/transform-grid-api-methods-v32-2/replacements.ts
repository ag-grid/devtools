import { ast, matchNode, pattern as p, replace, template } from '@ag-grid-devtools/ast';
import {
  type GridApiDeprecation,
  type GridApiReplacement,
} from '../../plugins/transform-grid-api-methods';

export const replacements: Array<GridApiReplacement> = [
  ...['', '?', '!']
    .map((apiOptionalChaining) => [
      replace(
        matchNode(({ api }) => ast.expression`${api}${apiOptionalChaining}.getInfiniteRowCount()`, {
          api: p.expression(),
        }),
        template(({ api }) => {
          return ast.expression`${api}${apiOptionalChaining}.getDisplayedRowCount()`;
        }),
      ),

      replace(
        matchNode(
          ({ api }) => ast.expression`${api}${apiOptionalChaining}.paginationGetRowCount()`,
          {
            api: p.expression(),
          },
        ),
        template(({ api }) => {
          return ast.expression`${api}${apiOptionalChaining}.paginationGetRootRowCount()`;
        }),
      ),

      replace(
        matchNode(
          ({ api }) => ast.expression`${api}${apiOptionalChaining}.paginationGetTotalPages()`,
          {
            api: p.expression(),
          },
        ),
        template(({ api }) => {
          return ast.expression`${api}${apiOptionalChaining}.paginationGetPageCount()`;
        }),
      ),
    ])
    .flat(),
];

export const deprecations: Array<GridApiDeprecation> = [];
