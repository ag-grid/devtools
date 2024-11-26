import * as t from '@babel/types';
import { SegmentMatchFunction } from './match-utils';
import { NodePath } from '@ag-grid-devtools/ast';

export function or(...matchFunctions: SegmentMatchFunction[]) {
  return function (path: NodePath) {
    for (const matcher of matchFunctions) {
      const result = matcher(path);
      if (result) {
        return result;
      }
    }
    return undefined;
  };
}
