import { ast, matchNode, pattern as p, replace, template, node as t, type Types } from '@ag-grid-devtools/ast';
import {
  type GridApiDeprecation,
  type GridApiReplacement,
} from '../../plugins/transform-grid-api-methods';
type Identifier = Types.Identifier;
type StringLiteral = Types.StringLiteral;

export const replacements: Array<GridApiReplacement> = [
  replace(
    matchNode(({ api, colKey, rowNode }) => ast.expression`${api}.getValue(${colKey}, ${rowNode})`, {
      api: p.expression(),
      colKey: p.expression(),
      rowNode: p.expression(),
    }),
    template(({ api, colKey, rowNode }) => {
    return ast.expression`${api}.getCellValue(${t.objectExpression([
      t.objectProperty(t.identifier('colKey'), colKey),
      t.objectProperty(t.identifier('rowNode'), rowNode),
    ])})`;
    },
  ),
  )
];