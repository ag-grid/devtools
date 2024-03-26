import { nonNull } from '@ag-grid-devtools/utils';
import { Program } from '@babel/types';
import { AstType } from './types';
import { NodePath } from '../types';

export function inferImportedTypes(
  program: NodePath<Program>,
  importTypes: Record<string, AstType>,
): Map<NodePath, Set<AstType>> {
  return new Map(
    program
      .get('body')
      .map((node): [NodePath, Set<AstType>] | null => {
        if (!node.isImportDeclaration()) return null;
        const source = node.get('source').node.value;
        const types = importTypes[source];
        if (!types) return null;
        return [node, new Set([types])];
      })
      .filter(nonNull),
  );
}

export function inferGlobalTypes(
  program: NodePath<Program>,
  globalTypes: Record<string, AstType>,
): Map<NodePath, Set<AstType>> {
  const results = new Map<NodePath, Set<AstType>>();
  program.traverse({
    ReferencedIdentifier: (path) => {
      // Skip locally-bound variables
      const name = path.node.name;
      if (path.scope.hasBinding(name, true)) return;

      const nodeType = globalTypes[name];
      if (nodeType) {
        const existingTypes = results.get(path);
        const nodeTypes = existingTypes || new Set();
        if (!existingTypes) results.set(path, nodeTypes);
        nodeTypes.add(nodeType);
      }
    },
  });
  return results;
}
