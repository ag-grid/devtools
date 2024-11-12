import { NodePath } from '@ag-grid-devtools/ast';

import { match } from './match-utils';

type OnVisit = (conditions: any[], then: (results: any[]) => void) => Record<string, SimpleVisitor>;
type SimpleVisitor = (path: NodePath) => void;

export const createVisitor: OnVisit = (conditions: any[], then: (results: any[]) => void) => {
  const deepestType = conditions.at(-1).type;

  return {
    [deepestType]: (path: NodePath) => {
      const results = match(path, conditions);
      if (results) {
        then(results);
      }
    },
  } as Record<string, SimpleVisitor>;
};

export const combineVisitors = (visitors: Record<string, SimpleVisitor>[]) => {
  const groupedVisitors: Record<string, SimpleVisitor[]> = visitors.reduce((acc: any, entry) => {
    const key = Object.keys(entry)[0];
    const visitor = entry[key];
    if (!acc[key]) {
      acc[key] = [visitor];
    } else {
      acc[key].push(visitor);
    }
    return acc;
  }, {});

  return Object.entries(groupedVisitors)
    .map(([key, visitors]) => {
      return {
        [key]: (path: NodePath) => {
          visitors.forEach((visitor) => visitor(path));
        },
      };
    })
    .reduce((acc, visitor) => ({ ...acc, ...visitor }), {});
};
