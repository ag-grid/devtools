import { ast, matchNode, pattern as p, replace, template } from '@ag-grid-devtools/ast';
import {
  type GridApiDeprecation,
  type GridApiReplacement,
} from '../../plugins/transform-grid-api-methods';

export const replacements: Array<GridApiReplacement> = [];

export const deprecations: Array<GridApiDeprecation> = [
  ...['', '?', '!'].map((apiOptionalChaining) =>
    matchNode(({ api }) => ast.expression`${api}${apiOptionalChaining}.showLoadingOverlay()`, {
      api: p.expression(),
    }),
  ),
];
