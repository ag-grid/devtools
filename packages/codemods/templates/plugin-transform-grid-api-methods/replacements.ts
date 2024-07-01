import { ast, matchNode, pattern as p, replace, template } from '@ag-grid-devtools/ast';
import { type GridApiDeprecation, type GridApiReplacement } from '../../plugins/<%= plugin %>';

export const replacements: Array<GridApiReplacement> = [
  ...['', '?', '!']
    .map((apiOptionalChaining) => [
      // Replace helloWorld() with sayHello('world')
      replace(
        matchNode(({ api }) => ast.expression`${api}${apiOptionalChaining}.helloWorld()`, {
          api: p.expression(),
        }),
        template(({ api }) => ast.expression`${api}${apiOptionalChaining}.sayHello('world')`),
      ),
    ])
    .flat(),
];

export const deprecations: Array<GridApiDeprecation> = [
  ...['', '?', '!']
    .map((apiOptionalChaining) => [
      // Deprecate goodbyeWorld()
      matchNode(({ api }) => ast.expression`${api}${apiOptionalChaining}goodbyeWorld()`, {
        api: p.expression(),
      }),
    ])
    .flat(),
];
