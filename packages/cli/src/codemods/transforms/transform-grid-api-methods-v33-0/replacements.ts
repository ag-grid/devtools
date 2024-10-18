import { ast, matchNode, pattern as p, node as t, replace, template } from '@ag-grid-devtools/ast';
import type {
  GridApiDeprecation,
  GridApiReplacement,
} from '../../plugins/transform-grid-api-methods';

export const replacements: Array<GridApiReplacement> = [
  // selectAll(source)
  ...['', '?', '!'].map((apiOptionalChaining) =>
    replace(
      matchNode(
        ({ api, source }) => ast.expression`${api}${apiOptionalChaining}.selectAll(${source})`,
        {
          api: p.expression(),
          source: p.expression(),
        },
      ),
      template(
        ({ api, source }) =>
          ast.expression`${api}${apiOptionalChaining}.selectAll(${t.stringLiteral('all')}, ${source})`,
      ),
    ),
  ),

  // deselectAll(source)
  ...['', '?', '!'].map((apiOptionalChaining) =>
    replace(
      matchNode(
        ({ api, source }) => ast.expression`${api}${apiOptionalChaining}.deselectAll(${source})`,
        {
          api: p.expression(),
          source: p.expression(),
        },
      ),
      template(
        ({ api, source }) =>
          ast.expression`${api}${apiOptionalChaining}.deselectAll(${t.stringLiteral('all')}, ${source})`,
      ),
    ),
  ),

  // selectAllFiltered(source)
  ...['', '?', '!'].map((apiOptionalChaining) =>
    replace(
      matchNode(
        ({ api, source }) =>
          ast.expression`${api}${apiOptionalChaining}.selectAllFiltered(${source})`,
        {
          api: p.expression(),
          source: p.expression(),
        },
      ),
      template(
        ({ api, source }) =>
          ast.expression`${api}${apiOptionalChaining}.selectAll(${t.stringLiteral('filtered')}, ${source})`,
      ),
    ),
  ),

  // selectAllFiltered()
  ...['', '?', '!'].map((apiOptionalChaining) =>
    replace(
      matchNode(({ api }) => ast.expression`${api}${apiOptionalChaining}.selectAllFiltered()`, {
        api: p.expression(),
      }),
      template(
        ({ api }) =>
          ast.expression`${api}${apiOptionalChaining}.selectAll(${t.stringLiteral('filtered')})`,
      ),
    ),
  ),

  // deselectAllFiltered()
  ...['', '?', '!'].map((apiOptionalChaining) =>
    replace(
      matchNode(({ api }) => ast.expression`${api}${apiOptionalChaining}.deselectAllFiltered()`, {
        api: p.expression(),
      }),
      template(
        ({ api }) =>
          ast.expression`${api}${apiOptionalChaining}.deselectAll(${t.stringLiteral('filtered')})`,
      ),
    ),
  ),

  // deselectAllFiltered(source)
  ...['', '?', '!'].map((apiOptionalChaining) =>
    replace(
      matchNode(
        ({ api, source }) =>
          ast.expression`${api}${apiOptionalChaining}.deselectAllFiltered(${source})`,
        {
          api: p.expression(),
          source: p.expression(),
        },
      ),
      template(
        ({ api, source }) =>
          ast.expression`${api}${apiOptionalChaining}.deselectAll(${t.stringLiteral('filtered')}, ${source})`,
      ),
    ),
  ),

  // selectAllOnCurrentPage(source)
  ...['', '?', '!'].map((apiOptionalChaining) =>
    replace(
      matchNode(
        ({ api, source }) =>
          ast.expression`${api}${apiOptionalChaining}.selectAllOnCurrentPage(${source})`,
        {
          api: p.expression(),
          source: p.expression(),
        },
      ),
      template(
        ({ api, source }) =>
          ast.expression`${api}${apiOptionalChaining}.selectAll(${t.stringLiteral('currentPage')}, ${source})`,
      ),
    ),
  ),

  // selectAllOnCurrentPage()
  ...['', '?', '!'].map((apiOptionalChaining) =>
    replace(
      matchNode(
        ({ api }) => ast.expression`${api}${apiOptionalChaining}.selectAllOnCurrentPage()`,
        {
          api: p.expression(),
        },
      ),
      template(
        ({ api }) =>
          ast.expression`${api}${apiOptionalChaining}.selectAll(${t.stringLiteral('currentPage')})`,
      ),
    ),
  ),

  // deselectAllOnCurrentPage(source)
  ...['', '?', '!'].map((apiOptionalChaining) =>
    replace(
      matchNode(
        ({ api, source }) =>
          ast.expression`${api}${apiOptionalChaining}.deselectAllOnCurrentPage(${source})`,
        {
          api: p.expression(),
          source: p.expression(),
        },
      ),
      template(
        ({ api, source }) =>
          ast.expression`${api}${apiOptionalChaining}.deselectAll(${t.stringLiteral('currentPage')}, ${source})`,
      ),
    ),
  ),

  // deselectAllOnCurrentPage()
  ...['', '?', '!'].map((apiOptionalChaining) =>
    replace(
      matchNode(
        ({ api }) => ast.expression`${api}${apiOptionalChaining}.deselectAllOnCurrentPage()`,
        {
          api: p.expression(),
        },
      ),
      template(
        ({ api }) =>
          ast.expression`${api}${apiOptionalChaining}.deselectAll(${t.stringLiteral('currentPage')})`,
      ),
    ),
  ),
];

export const deprecations: Array<GridApiDeprecation> = [];
