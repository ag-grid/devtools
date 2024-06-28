import { Enum, VARIANT } from '@ag-grid-devtools/utils';

export interface TemplateNode<T extends TNode, TRoot, TNode> {
  node: T;
  path: TemplatePath;
  template: TemplateSource<TRoot, TNode>;
}

export interface TemplateSource<TRoot, TNode> {
  engine: TemplateEngine<TNode>;
  source: string;
  root: TRoot;
  mutations: Array<TemplateMutation<TNode>>;
}

export interface TemplateEngine<TNode> {
  getNodeChildKeys(node: TNode): ReadonlyArray<PropertyKey> | null;
  getNodeChild(parent: TNode, childKey: PropertyKey): TNode | Array<TNode> | null;
}

export type TemplateRange = {
  start: number;
  end: number;
};

export type TemplatePath = Array<PropertyKey>;

export type TemplateMutation<TNode> = Enum<{
  ReplaceChild: {
    path: TemplatePath;
    value: TNode | null;
  };
  RemoveListChild: {
    path: TemplatePath;
  };
  ReplaceListChild: {
    path: TemplatePath;
    value: TNode;
  };
}>;

const TemplateMutation = Enum.create<TemplateMutation<any>>({
  ReplaceChild: true,
  RemoveListChild: true,
  ReplaceListChild: true,
});

export type TemplateNodeMatcher<T extends TNode, TRoot, TNode> = (
  node: TemplateNode<TNode, TRoot, TNode>,
) => node is TemplateNode<T, TRoot, TNode>;

export interface TemplateVisitor<TRoot, TNode> {
  enter(node: TemplateNode<TNode, TRoot, TNode>): void;
  leave(node: TemplateNode<TNode, TRoot, TNode>): void;
}

export interface TemplateFormatter<TRoot, TNode> {
  getRootNode(root: TRoot): TNode;
  getRootPaths?(root: TRoot, path: TemplatePath): Array<TemplatePath>;
  getNodeRange(node: TNode): TemplateRange;
  printNode(node: TNode, previous: TNode | null, templateSource: string): string;
}

export function getTemplateNodeChild<T extends TNode, TNode, TRoot>(
  templateNode: TemplateNode<T, TRoot, TNode>,
  key: PropertyKey,
): TemplateNode<TNode, TRoot, TNode> | Array<TemplateNode<TNode, TRoot, TNode>> | null {
  const { node, path, template } = templateNode;
  const { engine } = template;
  const child = engine.getNodeChild(node, key);
  if (Array.isArray(child)) {
    return child.map((child, index) => ({
      node: child,
      path: [...path, key, index],
      template,
    })) as any;
  } else if (child) {
    return { node: child, path: [...path, key], template } as any;
  } else {
    return null;
  }
}

export function findTemplateNodes<T extends TNode, TRoot, TNode>(
  root: TemplateNode<TNode, TRoot, TNode>,
  predicate: TemplateNodeMatcher<T, TRoot, TNode>,
): Array<TemplateNode<T, TRoot, TNode>> {
  const visitor = new TemplateNodeMatcherVisitor(predicate);
  traverseTemplate(root, visitor);
  return visitor.results;
}

class TemplateNodeMatcherVisitor<T extends TNode, TRoot, TNode>
  implements TemplateVisitor<TRoot, TNode>
{
  public results: Array<TemplateNode<T, TRoot, TNode>> = [];
  constructor(private predicate: TemplateNodeMatcher<T, TRoot, TNode>) {}
  enter(node: TemplateNode<TNode, TRoot, TNode>): void {
    if (this.predicate(node)) this.results.push(node);
  }
  leave(templateNode: TemplateNode<TNode, TRoot, TNode>): void {}
}

function traverseTemplate<TRoot, TNode>(
  templateNode: TemplateNode<TNode, TRoot, TNode>,
  visitor: TemplateVisitor<TRoot, TNode>,
): void {
  visitor.enter(templateNode);
  const { template, node, path } = templateNode;
  const { engine } = template;
  const keys = engine.getNodeChildKeys(node);
  if (keys) {
    for (const key of keys) {
      const child = engine.getNodeChild(node, key);
      if (Array.isArray(child)) {
        child.forEach((child, index) => {
          traverseTemplate({ template, node: child, path: [...path, key, index] }, visitor);
        });
      } else if (child) {
        traverseTemplate({ template, node: child, path: [...path, key] }, visitor);
      }
    }
  }
  visitor.leave(templateNode);
}

export function replaceTemplateNode<T extends TNode, TRoot, TNode>(
  target: TemplateNode<TNode, TRoot, TNode>,
  replacement: T,
): TemplateNode<T, TRoot, TNode> {
  const { path, template } = target;
  template.mutations.push(TemplateMutation.ReplaceChild({ path, value: replacement }));
  return { node: replacement, path, template };
}

export function removeTemplateNode<TRoot, TNode>(target: TemplateNode<TNode, TRoot, TNode>): void {
  const { path, template } = target;
  const key = path.length > 0 ? path[path.length - 1] : null;
  if (typeof key === 'number') {
    template.mutations.push(TemplateMutation.RemoveListChild({ path }));
  } else {
    template.mutations.push(TemplateMutation.ReplaceChild({ path, value: null }));
  }
}

export function printTemplate<TRoot, TNode>(
  ast: TemplateNode<TNode, TRoot, TNode>,
  formatter: TemplateFormatter<TRoot, TNode>,
): string | null {
  const { template, path } = ast;
  const { engine } = template;
  const templateRoot = formatter.getRootNode(template.root);
  const rootPaths = formatter.getRootPaths ? formatter.getRootPaths(template.root, path) : [path];
  const chunkSets = rootPaths.map((path) => {
    const original = path.reduce(
      (parent, childKey) => {
        if (!parent) return null;
        if (Array.isArray(parent)) return parent[childKey as number] || null;
        return engine.getNodeChild(parent, childKey as keyof TNode);
      },
      templateRoot as TNode | Array<TNode> | null,
    );
    if (!original || Array.isArray(original)) return null;
    const mutations = path.reduce(
      (mutations, childKey) => (mutations && mutations.children.get(childKey)) || null,
      generateMutationTree(template.mutations),
    );
    return formatUpdatedNode(original, path, mutations, template.source, engine, formatter);
  });
  if (!chunkSets.every(Boolean)) return null;
  return mergeSourceChunks(chunkSets.flatMap((chunks) => chunks || []));
}

export type SourceChunk<TNode> =
  | string
  | { source: TemplateSource<any, TNode>['source']; range: TemplateRange };

export function mergeSourceChunks<TNode>(chunks: Array<SourceChunk<TNode>>): string {
  const { completed, pending } = chunks.reduce(
    (
      { pending, completed },
      chunk,
    ): {
      completed: Array<string>;
      pending: { source: TemplateSource<any, TNode>['source']; range: TemplateRange } | null;
    } => {
      if (typeof chunk === 'string') {
        if (pending) {
          completed.push(pending.source.slice(pending.range.start, pending.range.end));
        }
        completed.push(chunk);
        return { completed, pending: null };
      } else {
        if (!pending) {
          return { completed, pending: chunk };
        } else if (
          pending &&
          pending.source === chunk.source &&
          pending.range.start === chunk.range.start
        ) {
          return {
            completed,
            pending: {
              source: pending.source,
              range: { start: pending.range.start, end: chunk.range.end },
            },
          };
        } else {
          completed.push(pending.source.slice(pending.range.start, pending.range.end));
          return { completed, pending: chunk };
        }
      }
    },
    {
      completed: new Array<string>(),
      pending: null as {
        source: TemplateSource<any, TNode>['source'];
        range: TemplateRange;
      } | null,
    },
  );
  if (pending) completed.push(pending.source.slice(pending.range.start, pending.range.end));
  return completed.join('');
}

interface MutationTree<TNode> {
  mutations: Array<TemplateMutation<TNode>>;
  children: Map<PropertyKey, MutationTree<TNode>>;
}

function generateMutationTree<TNode>(
  mutations: Array<TemplateMutation<TNode>>,
): MutationTree<TNode> | null {
  if (mutations.length === 0) return null;
  return mutations.reduce(
    (tree, mutation) => {
      const { path } = mutation;
      const childTree = path.reduce((tree, key) => {
        const existingChildTree = tree.children.get(key);
        const childTree: MutationTree<TNode> = existingChildTree || {
          mutations: [],
          children: new Map(),
        };
        if (!existingChildTree) tree.children.set(key, childTree);
        return childTree;
      }, tree);
      childTree.mutations.push(mutation);
      return tree;
    },
    {
      mutations: [],
      children: new Map(),
    } as MutationTree<TNode>,
  );
}

function formatUpdatedNode<TRoot, TNode>(
  node: TNode,
  path: TemplatePath,
  pathMutations: MutationTree<TNode> | null,
  source: TemplateSource<TRoot, TNode>['source'],
  engine: TemplateEngine<TNode>,
  formatter: TemplateFormatter<TRoot, TNode>,
): Array<SourceChunk<TNode>> {
  const range = formatter.getNodeRange(node);
  if (!pathMutations) return [{ source, range }];
  const pathMutation =
    pathMutations.mutations.length > 0
      ? pathMutations.mutations[pathMutations.mutations.length - 1]
      : null;
  if (pathMutation) {
    switch (pathMutation[VARIANT]) {
      case 'ReplaceChild':
      case 'ReplaceListChild': {
        const { value } = pathMutation;
        return value ? [formatter.printNode(value, node, source)] : [];
      }
      case 'RemoveListChild':
        return [];
    }
  }
  const childKeys = engine.getNodeChildKeys(node);
  if (!childKeys) return [{ source, range }];
  const childSlots = childKeys
    .flatMap((childKey) => {
      const originalChild = engine.getNodeChild(node, childKey);
      return Array.isArray(originalChild)
        ? originalChild.map((child, index) => {
            return { path: [childKey, index], range: formatter.getNodeRange(child) };
          })
        : originalChild
          ? [{ path: [childKey], range: formatter.getNodeRange(originalChild) }]
          : // FIXME: support optional template node child keys
            [];
    })
    .sort((a, b) => a.range.start - b.range.start);
  if (childSlots.length === 0) return [{ source, range }];
  const { start, end } = range;
  const templateElements = childSlots.flatMap(
    (
      slot,
      index,
      array,
    ): Array<{
      range: TemplateRange;
      path: Array<PropertyKey> | null;
    }> => {
      const previousSlot = index === 0 ? null : array[index - 1];
      const previousLiteral = {
        range: {
          start: previousSlot ? previousSlot.range.end : start,
          end: slot.range.start,
        },
        path: null,
      };
      const nextLiteral =
        index === array.length - 1
          ? { range: { start: slot.range.end, end: end }, path: null }
          : null;
      return [previousLiteral, slot, ...(nextLiteral ? [nextLiteral] : [])];
    },
  );
  return templateElements.flatMap(({ path: childPath, range }): Array<SourceChunk<TNode>> => {
    const childMutations = childPath
      ? childPath.reduce(
          (mutations, key) => (mutations && mutations.children.get(key)) || null,
          pathMutations as MutationTree<TNode> | null,
        )
      : null;
    const child = childPath
      ? childPath.reduce(
          (node, key): TNode | Array<TNode> | null => {
            if (!node) return null;
            if (Array.isArray(node)) return node[key as number] || null;
            return engine.getNodeChild(node, key);
          },
          node as TNode | Array<TNode> | null,
        )
      : null;
    if (!childPath || !child || Array.isArray(child)) return [{ source, range }];
    return formatUpdatedNode(
      child,
      [...path, ...childPath],
      childMutations,
      source,
      engine,
      formatter,
    );
  });
}
