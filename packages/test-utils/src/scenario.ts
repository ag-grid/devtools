import { readdirSync, readFileSync, statSync, type Stats } from 'node:fs';
import { basename, join, sep } from 'node:path';
import { withErrorPrefix } from './error';

export type ScenarioLoader<I, O> = (path: string) => { input: I; expected: O };
export type ScenarioRunner<I, O> = (input: I, expected: O, scenarioPath: string) => void;

export function loadScenarios<I, O>(
  scenariosPath: string,
  options: {
    test?: (filename: string) => boolean;
    loader: ScenarioLoader<I, O>;
    runner: ScenarioRunner<I, O>;
    describe: (name: string | Function, fn: () => void) => void;
    manifest?: string;
  },
) {
  const {
    loader,
    runner,
    describe,
    manifest: manifestFilename = 'scenario.json',
    test = () => true,
  } = options;
  const scenarios = findInDirectorySync(
    scenariosPath,
    (path, stats) => stats.isDirectory() || (basename(path) === manifestFilename && test(path)),
  ).map((relativePath) => {
    const filePath = join(scenariosPath, relativePath);
    const pathSegments = relativePath.split(sep);
    const hierarchy = pathSegments.slice(0, -1);
    const scenarioData = withErrorPrefix(
      `Failed to load scenario definition file: ${filePath}`,
      () => loader(filePath),
    );
    if (
      !scenarioData ||
      typeof scenarioData !== 'object' ||
      !('input' in scenarioData) ||
      !('expected' in scenarioData)
    ) {
      throw new Error(`Invalid scenario definition file: ${filePath}`);
    }
    const { input, expected } = scenarioData;
    return {
      path: filePath,
      hierarchy,
      input: input as I,
      expected: expected as O,
    };
  });
  const nestedScenarios = buildNestedHierarchy(
    scenarios,
    (scenario) => scenario.hierarchy.length,
    (scenario, depthIndex) => scenario.hierarchy[depthIndex],
  );
  (function emitTests(nestedScenarios): void {
    const { leaves, children } = nestedScenarios;
    for (const scenario of leaves) {
      const { path, input, expected } = scenario;
      runner(input, expected, path);
    }
    for (const [groupName, groupScenarios] of children.entries()) {
      describe(groupName, () => {
        emitTests(groupScenarios);
      });
    }
  })(nestedScenarios);
}

function findInDirectorySync(
  path: string,
  predicate: (path: string, stats: Stats) => boolean,
): Array<string> {
  const filenames = readdirSync(path);
  const files = filenames.flatMap((filename) => {
    const stats = statSync(join(path, filename));
    const filePath = join(path, filename);
    if (!predicate(filePath, stats)) return [];
    if (!stats.isDirectory()) return [filename];
    const children = findInDirectorySync(filePath, predicate);
    return children.map((childFilename) => join(filename, childFilename));
  });

  return files;
}

type Tree<K, V> = {
  leaves: V[];
  children: Map<K, Tree<K, V>>;
};

function buildNestedHierarchy<K, V extends object>(
  data: V[],
  getItemDepth: (item: V) => number,
  getItemGroupKey: (item: V, depthIndex: number) => K,
): Tree<K, V> {
  const hierarchy: Tree<K, V> = { leaves: [], children: new Map() };
  return data.reduce((hierarchy, item) => {
    const itemDepth = getItemDepth(item);
    const currentDepth = 0;
    return createNestedItemHierarchy(item, itemDepth, getItemGroupKey, currentDepth, hierarchy);
  }, hierarchy);

  function createNestedItemHierarchy(
    item: V,
    itemDepth: number,
    getItemGroupKey: (item: V, depthIndex: number) => K,
    currentDepth: number,
    hierarchy: Tree<K, V>,
  ): Tree<K, V> {
    if (currentDepth === itemDepth) {
      hierarchy.leaves.push(item);
      return hierarchy;
    } else {
      const key = getItemGroupKey(item, currentDepth);
      const existingChildHierarchy = hierarchy.children.get(key);
      const childHierarchy = createNestedItemHierarchy(
        item,
        itemDepth,
        getItemGroupKey,
        currentDepth + 1,
        existingChildHierarchy || { leaves: [], children: new Map() },
      );
      hierarchy.children.set(key, childHierarchy);
      return hierarchy;
    }
  }
}
