import { ast, matchNode, pattern as p, replace, template } from '@ag-grid-devtools/ast';
import {
  type GridApiDeprecation,
  type GridApiReplacement,
} from '../../plugins/<%= plugin %>';

export const replacements: Array<GridApiReplacement> = [
  replace(
    matchNode(({ api }) => ast.expression`${api}.helloWorld()`, {
      api: p.expression(),
    }),
    template(({ api }) => ast.expression`${api}.sayHello('world')`),
  ),
];

export const deprecations: Array<GridApiDeprecation> = [
  matchNode(({ api }) => ast.expression`${api}.goodbyeWorld()`, {
    api: p.expression(),
  }),
];
