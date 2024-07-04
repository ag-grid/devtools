import {
  ast,
  findNamedModuleImport,
  generateUniqueScopeBinding,
  getNamedModuleImportExpression,
  insertNamedModuleImport,
  matchModuleImportName,
  matchNamedPropertyKeyExpression,
  matchNode as matchNode,
  node as t,
  pattern as p,
  template,
  type AstCliContext,
  type AstTransform,
  type Types,
  getNamedObjectLiteralStaticProperty,
  NodePath,
  AG_GRID_JS_CONSTRUCTOR_EXPORT_NAME,
} from '@ag-grid-devtools/ast';
import { AG_GRID_JS_PACKAGE_NAME_MATCHER } from '@ag-grid-devtools/codemod-utils';
import { match, nonNull } from '@ag-grid-devtools/utils';

type Expression = Types.Expression;
type Identifier = Types.Identifier;
type ObjectPattern = Types.ObjectPattern;
type ObjectProperty = Types.ObjectProperty;

const LEGACY_GRID_API_EXPORT_NAME = 'Grid';
const GRID_API_ACCESSOR_NAME = 'api';
const COLUMN_API_ACCESSOR_NAME = 'columnApi';

// Used to denote that this plugin has modified the module source
// (this allows us to skip unused import cleanup if there are no changes to the current file)
const UPDATED = Symbol();

// Matcher for legacy Grid API constructor invocations
const gridApiConstructorPattern = matchNode(
  ({ constructorClass, element, options }) => ast.statement`
    new ${constructorClass}(${element}, ${options});
  `,
  {
    constructorClass: p.expression(),
    element: p.expression(),
    options: p.identifier(),
  },
);

// Template for constructing a new-style grid instance
const gridApiConstructorReplacement = template(
  (variables: {
    instanceName: Identifier;
    constructorClass: Expression;
    element: Expression;
    options: Identifier;
  }) => {
    const { instanceName, constructorClass, element, options } = variables;
    return ast.statement`
      const ${instanceName} = ${constructorClass}(${element}, ${options});
    `;
  },
);

const transform: AstTransform<AstCliContext> = function migrateLegacyJsGridConstructor(babel) {
  const { types: t } = babel;
  return {
    visitor: {
      // Replace legacy constructor statements with new-style variable assignments
      // FIXME: Consider directly accessing properties on anonymous Grid constructor results
      Statement(path, state) {
        // Match any potential 2-arg constructor statements
        const matchResults = gridApiConstructorPattern.match(path);
        if (!matchResults) return;

        // Extract the captured name and arguments from the matched constructor statement
        const { constructorClass, options, element } = matchResults;
        const optionsVariableName = options.node.name;

        // Determine whether the constructor refers to the legacy Grid class, and bail out if not
        const legacyGridApiImport = getNamedModuleImportExpression(
          constructorClass,
          AG_GRID_JS_PACKAGE_NAME_MATCHER,
          LEGACY_GRID_API_EXPORT_NAME,
          state,
        );
        if (!legacyGridApiImport) return;

        const fromUserConfig = legacyGridApiImport.importMatcherResult.fromUserConfig;
        const updatedConstructorExportName =
          (fromUserConfig && state.opts.userConfig?.getCreateGridName?.(fromUserConfig)) ||
          AG_GRID_JS_CONSTRUCTOR_EXPORT_NAME;

        // Rewrite the legacy Grid import to the new-style createGrid import
        const updatedConstructorClass = match(legacyGridApiImport.binding, {
          Module: ({ declaration, accessor }) =>
            match(accessor, {
              Named: ({}) => {
                const existingConstructorImport = findNamedModuleImport(
                  declaration.node,
                  updatedConstructorExportName,
                  state,
                );
                if (existingConstructorImport) return existingConstructorImport.local;
                return insertNamedModuleImport(
                  declaration,
                  t.importSpecifier(
                    generateUniqueScopeBinding(path.scope, updatedConstructorExportName),
                    t.identifier(updatedConstructorExportName),
                  ),
                );
              },
              Namespaced: ({ accessor, local }) => {
                const exportedName = t.identifier(updatedConstructorExportName);
                const key = exportedName;
                const computed = false;
                const [updatedAccessor] = accessor.replaceWith(
                  t.memberExpression(accessor.node.object, key, computed),
                );
                return local ? local.node : updatedAccessor.node;
              },
            }),
          CommonJs: ({ accessor }) =>
            match(accessor, {
              Destructured: ({ accessors }) => {
                const existingConstructorImportReference =
                  findNamedDestructuredPropertyLocalIdentifier(
                    accessors,
                    updatedConstructorExportName,
                  );
                if (existingConstructorImportReference) {
                  return existingConstructorImportReference.node;
                }
                const exportedName = t.identifier(updatedConstructorExportName);
                const localIdentifier = generateUniqueScopeBinding(path.scope, exportedName.name);
                const key = exportedName;
                const value = localIdentifier;
                const computed = false;
                const shorthand = key.name === value.name;
                insertNamedDestructuredPropertyAccessor(
                  accessors,
                  t.objectProperty(key, value, computed, shorthand),
                );
                return localIdentifier;
              },
              Namespaced: ({ accessor, local }) => {
                const exportedName = t.identifier(updatedConstructorExportName);
                const key = exportedName;
                const computed = false;
                const [updatedAccessor] = accessor.replaceWith(
                  t.memberExpression(accessor.node.object, key, computed),
                );
                return local ? local.node : updatedAccessor.node;
              },
            }),
          UmdGlobal: ({ accessor }) =>
            match(accessor, {
              Destructured: ({ accessors }) => {
                const existingConstructorImportReference =
                  findNamedDestructuredPropertyLocalIdentifier(
                    accessors,
                    updatedConstructorExportName,
                  );
                if (existingConstructorImportReference) {
                  return existingConstructorImportReference.node;
                }
                const exportedName = t.identifier(updatedConstructorExportName);
                const localIdentifier = generateUniqueScopeBinding(path.scope, exportedName.name);
                const key = exportedName;
                const value = localIdentifier;
                const computed = false;
                const shorthand = key.name === value.name;
                insertNamedDestructuredPropertyAccessor(
                  accessors,
                  t.objectProperty(key, value, computed, shorthand),
                );
                return localIdentifier;
              },
              Namespaced: ({ accessor, local }) => {
                const exportedName = t.identifier(updatedConstructorExportName);
                const key = exportedName;
                const computed = false;
                const [updatedAccessor] = accessor.replaceWith(
                  t.memberExpression(accessor.node.object, key, computed),
                );
                return local ? local.node : updatedAccessor.node;
              },
            }),
        });

        // Replace the legacy Grid constructor statement with a new-style variable assignment
        const instanceName = generateUniqueScopeBinding(
          path.scope,
          `${optionsVariableName.replace(/Options$/, '')}Api`,
        );
        const constructorAssignment = gridApiConstructorReplacement.render({
          instanceName,
          constructorClass: updatedConstructorClass,
          element: element.node,
          options: options.node,
        });
        const [updatedPath] = path.replaceWith(constructorAssignment);
        path = updatedPath;
        state.set(UPDATED, true);

        // Find all references to the legacy Grid instance `.api` / `.columnApi` properties of the options argument
        const optionsVariableBinding = path.scope.getBinding(optionsVariableName) || null;
        const optionsApiReferences = optionsVariableBinding
          ? optionsVariableBinding.referencePaths
              .map((path) => {
                const propertyAccessor = path.parentPath;
                if (
                  !propertyAccessor ||
                  (!propertyAccessor.isMemberExpression() &&
                    !propertyAccessor.isOptionalMemberExpression())
                ) {
                  return null;
                }
                const object = propertyAccessor.get('object') as NodePath<t.Expression>;
                const property = propertyAccessor.get('property') as NodePath<t.Expression>;
                const computed = propertyAccessor.node.computed;
                if (object.node !== path.node) return null;
                const isApiProperty = matchNamedPropertyKeyExpression(
                  GRID_API_ACCESSOR_NAME,
                  property,
                  computed,
                );
                const isColumnApiProperty = matchNamedPropertyKeyExpression(
                  COLUMN_API_ACCESSOR_NAME,
                  property,
                  computed,
                );
                if (isApiProperty || isColumnApiProperty) return propertyAccessor;
                return null;
              })
              .filter(nonNull)
          : null;

        // FIXME: Hoist grid constructor to parent scope if necessary

        // Rewrite the legacy Grid `.api` / `columnApi` references to target the newly-assigned Grid API instance
        if (optionsApiReferences) {
          optionsApiReferences.forEach((reference) => {
            // FIXME: ensure new-style grid instance identifier name is valid within reference scope
            reference.replaceWith(instanceName);
          });
        }
      },
      // FIXME: rewrite TypeScript type annotations
      // Clean up any lingering import references to the legacy Grid API
      Program: {
        // Perform the transform after the legacy Grid API references have been rewritten
        exit: (path, state) => {
          // Skip this file if the AST has not been modified by this plugin
          if (!state.get(UPDATED)) return;

          // Recompute binding references (this is necessary to ensure that scope references are up-to-date)
          path.scope.crawl();

          // Iterate over top-level variables, removing any unused import references to the legacy API
          Object.values(path.scope.bindings).forEach((binding) => {
            // Determine whether this is an unused import declaration, bailing out if not
            if (binding.kind !== 'module' || binding.referenced) return;
            const target = binding.path;
            if (!target.isImportSpecifier() || !target.parentPath.isImportDeclaration()) {
              return null;
            }

            // Determine whether this is a reference to the legacy Grid API, bailing out if not
            if (
              !matchModuleImportName(
                target.parentPath.node,
                target.node,
                AG_GRID_JS_PACKAGE_NAME_MATCHER,
                LEGACY_GRID_API_EXPORT_NAME,
                state,
              )
            )
              return;

            // Now that we have located an unused legacy API import specifier, remove it from the AST
            target.remove();
          });
        },
      },
    },
  };
};

export default transform;

function findNamedDestructuredPropertyLocalIdentifier(
  accessors: NodePath<t.ObjectPattern>,
  propertyKey: string,
): NodePath<Identifier> | null {
  const existingPropertyAccessor = getNamedObjectLiteralStaticProperty(accessors, propertyKey);
  if (!existingPropertyAccessor || !existingPropertyAccessor.isObjectProperty()) return null;
  const local = existingPropertyAccessor.get('value');
  if (local.isIdentifier()) return local;
  return null;
}

export function insertNamedDestructuredPropertyAccessor(
  pattern: NodePath<ObjectPattern>,
  accessor: ObjectProperty,
) {
  pattern.pushContainer('properties', accessor);
}
