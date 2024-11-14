import { NodePath } from '@ag-grid-devtools/ast';

import * as m from './match-utils';

type OnVisit = (conditions: any[], then: (results: any[]) => void) => Record<string, SimpleVisitor>;
type OnComplexVisit = (complex: m.ComplexTransform) => Record<string, SimpleVisitor>[];
type SimpleVisitor = (path: NodePath) => void;

export const createOrchestrator = (complex: m.ComplexTransform) => {
  const allResults: m.OrderedRecord<string, m.SegmentMatchResult[]> = Object.keys(
    complex.matchOn,
  ).reduce((acc, key) => ({ ...acc, [key]: undefined }), {} as any);

  return {
    submit: (key: string, results: m.SegmentMatchResult[]) => {
      allResults[key] = results;
      if (Object.values(allResults).every((results) => results !== undefined)) {
        complex.transformer(allResults);
      }
    },
  };
};

export const createComplexVisitor: OnComplexVisit = (complex: m.ComplexTransform) => {
  const { matchOn } = complex;

  const orchestrator = createOrchestrator(complex);

  const visitors = Object.entries(matchOn).map(([key, conditions]) => {
    const visitor = createVisitor(conditions, (results) => {
      return orchestrator.submit(key, results);
    });

    return visitor;
  });

  return Object.values(visitors);
};

export const createVisitor: OnVisit = (conditions: any[], then: (results: any[]) => void) => {
  const deepestType = conditions.at(-1).type;

  return {
    [deepestType]: (path: NodePath) => {
      const results = m.match(path, conditions);
      if (results) {
        then(results);
      }
    },
  };
};

export const combineVisitors = (
  ...visitors: Record<string, SimpleVisitor>[] | Record<string, SimpleVisitor>[][]
) => {
  const flattened = visitors.flat();

  const groupedVisitors: Record<string, SimpleVisitor[]> = flattened.reduce((acc: any, entry) => {
    const key = Object.keys(entry)[0];
    const visitor = entry[key];
    if (!acc[key]) {
      acc[key] = [visitor];
    } else {
      acc[key].push(visitor);
    }

    return acc;
  }, {});

  const combined = Object.entries(groupedVisitors)
    .map(([key, visitors]) => {
      return {
        [key]: (path: NodePath) => {
          visitors.forEach((visitor) => {
            return visitor(path);
          });
        },
      };
    })
    .reduce((acc, visitor) => ({ ...acc, ...visitor }), {});

  return combined;
};
