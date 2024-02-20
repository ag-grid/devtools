import { readdirSync, readFileSync, statSync, type Stats } from 'node:fs';
import { basename, join, sep } from 'node:path';

export type ScenarioLoader<I, O> = (path: string) => { input: I; expected: O };
export type ScenarioRunner<I, O> = (input: I, expected: O, scenarioPath: string) => void;

export function loadScenarios<I, O>(
  scenariosPath: string,
  options: {
    loader: ScenarioLoader<I, O>;
    runner: ScenarioRunner<I, O>;
    describe: (name: string | Function, fn: () => void) => void;
    manifest?: string;
  },
) {
  const {
    loader = loadJsonFile,
    runner,
    describe,
    manifest: manifestFilename = 'scenario.json',
  } = options;
  const scenarios = findInDirectorySync(
    scenariosPath,
    (path, stats) => stats.isDirectory() || basename(path) === manifestFilename,
  ).map((relativePath) => {
    const filePath = join(scenariosPath, relativePath);
    const pathSegments = relativePath.split(sep);
    const hierarchy = pathSegments.slice(0, -1);
    const scenarioData = loader(filePath);
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
  return filenames.flatMap((filename) => {
    const stats = statSync(join(path, filename));
    const filePath = join(path, filename);
    if (!predicate(filePath, stats)) return [];
    if (!stats.isDirectory()) return [filename];
    const children = findInDirectorySync(filePath, predicate);
    return children.map((childFilename) => join(filename, childFilename));
  });
}

export function loadJsonFile<T = unknown>(path: string): T {
  const json = readFileSync(path, 'utf-8');
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new Error(`Invalid JSON file: ${path}`);
  }
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
