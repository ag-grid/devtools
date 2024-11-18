import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import * as m from './match-utils';
import * as t from '@babel/types';
import * as v from './visitor-utils';
import { mergeImports, mergeTypecasts } from './transform-utils';

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const transform: AstTransform<AstCliContext> = function migrateSparklinesOptions(_babel) {
  const oldOptionNames = [
    'AreaSparklineOptions',
    'BarSparklineOptions',
    'ColumnSparklineOptions',
    'LineSparklineOptions',
  ];

  const newOptionName = 'AgSparklineOptions';
  const newPackage = 'ag-charts-types';

  const js = `{sparklineOptions: {type: 'column'}}`;
  const ast = parser.parse(js);
  // traverse(ast, v.createVisitor([

  // ], (results) => {

  // }));

  return {
    visitor: v.combineVisitors(
      v.createComplexVisitor(c2bTransform),
      v.createComplexVisitor(mergeImports(oldOptionNames, newOptionName, newPackage)),
      v.createComplexVisitor(mergeTypecasts(oldOptionNames, newOptionName)),
    ),
  };
};
