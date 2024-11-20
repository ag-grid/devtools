import * as v from '../visitor-utils';
import * as t from '@babel/types';
import * as m from '../match-utils';
import { newType, oldTypes } from './constants';

const mergeTypecasts = (from: string[], to: string) => {
  return v.createComplexVisitor({
    matchOn: {
      typecast: [m.typeReference({ names: from })],
    },
    transformer: (matches: Record<string, m.SegmentMatchResult[]>) => {
      const typecastPath = matches.typecast[0]!.path;
      typecastPath.replaceWith(t.tsTypeReference(t.identifier(to)));
    },
  });
};

export const types = mergeTypecasts(oldTypes, newType);
