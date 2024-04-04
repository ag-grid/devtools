import {
  ast,
  matchNode,
  node as t,
  pattern as p,
  replace,
  template,
  type AstCliContext,
  type AstTransform,
  type ExpressionPattern,
  type PatternVariableValues,
  type Replacement,
  type Types,
  NodeMatcher,
  AstTransformContext,
  AstType,
  BabelPluginContext,
  inferAstTypes,
  inferGlobalTypes,
  inferImportedTypes,
  NodePath,
} from '@ag-grid-devtools/ast';
import { isGridApiReference } from '@ag-grid-devtools/codemod-utils';
import { nonNull } from '@ag-grid-devtools/utils';

type Expression = Types.Expression;

export type GridApiReplacement = Replacement<
  PatternVariableValues<{ api: ExpressionPattern }>,
  Expression
>;

export type GridApiDeprecation = NodeMatcher<{
  api: ExpressionPattern;
}>;

export interface GridOptionSetterReplacementDefinition {
  option: string;
  optionalValue: boolean;
  transformValue: ((value: Expression) => Expression) | null;
  allowCustomSource: boolean;
}

export function transformGridApiMethods(options: {
  replacements: Array<GridApiReplacement>;
  deprecations: Array<GridApiDeprecation>;
}): AstTransform<AstCliContext> {
  const { replacements, deprecations } = options;

  const ColumnDefType = AstType.Object({});
  const ColumnDefsType = AstType.Array(ColumnDefType);
  const GridOptionsType = AstType.Object({
    columnDefs: ColumnDefsType,
  });
  const GridInstanceType = AstType.Object({});
  const CreateGridType = AstType.Function(
    AstType.Tuple([AstType.Any(), GridOptionsType]),
    GridInstanceType,
  );
  const AgGridModuleType = AstType.Object({
    createGrid: CreateGridType,
  });

  function getAgGridTypeAnnotations(program: NodePath<Types.Program>): Map<NodePath, Set<AstType>> {
    return new Map([
      ...inferImportedTypes(program, {
        'ag-grid-community': AgGridModuleType,
        'ag-grid-enterprise': AgGridModuleType,
        '@ag-grid-community/core': AgGridModuleType,
        '@ag-grid-enterprise/core': AgGridModuleType,
      }),
      ...inferGlobalTypes(program, {
        agGrid: AgGridModuleType,
      }),
    ]);
  }

  return function transformGridApiMethods(babel) {
    const STATE_KEY_TYPED_NODES = Symbol('typedNodes');
    const { types: t } = babel;
    return {
      visitor: {
        Program(path, context) {
          const typedNodes = getAgGridTypeAnnotations(path);
          assignNodeTypes(typedNodes, context);
        },
        // Transform deprecated Grid API method invocations
        CallExpression(path, context) {
          // Iterate over each of the replacements until a match is found
          for (const replacement of replacements) {
            // Attempt to apply the replacement to the current AST node, skipping if the node doesn't match this pattern
            const result = replacement.exec(path);
            if (!result) continue;

            // If this is an incidental match (naming collision with an identically-named user method), skip the replacement
            const { node, refs } = result;
            if (!isGridApiInstance(refs.api, context)) continue;

            // We've found a match, so replace the current AST node with the rewritten node and stop processing this node
            // FIXME: Match quote style in generated option key string literal
            path.replaceWith(node);

            // Prevent this node from being repeatedly transformed
            path.skip();
            return;
          }
          for (const deprecation of deprecations) {
            // Attempt to apply the replacement to the current AST node, skipping if the node doesn't match this pattern
            const result = deprecation.match(path);
            if (!result) continue;

            // If this is an incidental match (naming collision with an identically-named user method), skip the replacement
            const { api } = result;
            if (!isGridApiInstance(api, context)) continue;

            context.opts.fail(path, 'This method has been deprecated');

            // Prevent this node from being repeatedly transformed
            path.skip();
          }
        },
      },
    };

    function assignNodeTypes(typedNodes: Map<NodePath, Set<AstType>>, context: BabelPluginContext) {
      context.set(STATE_KEY_TYPED_NODES, inferAstTypes(typedNodes));
    }

    function isGridApiInstance(
      path: NodePath<Expression>,
      context: BabelPluginContext & AstTransformContext<AstCliContext>,
    ): boolean {
      const typedNodes: ReturnType<typeof inferAstTypes> | undefined =
        context.get(STATE_KEY_TYPED_NODES);
      const isGridInstance = typedNodes?.get(path)?.has(GridInstanceType) ?? false;
      if (isGridInstance) return true;
      // Legacy utility method, used to locate Grid API references within framework components
      return isGridApiReference(path, context);
    }
  };
}

export function getGridOptionSetterReplacements(
  options: Record<string, GridOptionSetterReplacementDefinition>,
): Array<GridApiReplacement> {
  return Object.entries(options).flatMap(
    ([method, { option, optionalValue, transformValue, allowCustomSource }]) => {
      const transform = transformValue || ((value: Expression) => value);
      // Generate a zero-arg method replacement if method's value is optional
      const nullaryMethod = optionalValue
        ? replace(
            matchNode(({ api }) => ast.expression`${api}.${t.identifier(method)}()`, {
              api: p.expression(),
            }),
            template(
              ({ api }) =>
                ast.expression`${api}.setGridOption(${t.stringLiteral(option)}, undefined)`,
            ),
          )
        : null;
      // Generate a one-arg method replacement for all replaced methods
      const unaryMethod = replace(
        matchNode(({ api, value }) => ast.expression`${api}.${t.identifier(method)}(${value})`, {
          api: p.expression(),
          value: p.expression(),
        }),
        template(
          ({ api, value }) =>
            ast.expression`${api}.setGridOption(${t.stringLiteral(option)}, ${transform(value)})`,
        ),
      );
      // Generate a two-arg method replacement if method allows an optional custom source parameter
      const binaryMethod = allowCustomSource
        ? replace(
            matchNode(
              ({ api, value, source }) =>
                ast.expression`${api}.${t.identifier(method)}(${value}, ${source})`,
              {
                api: p.expression(),
                value: p.expression(),
                source: p.expression(),
              },
            ),
            template(
              ({ api, value, source }) =>
                ast.expression`${api}.updateGridOptions({ options: { ${t.identifier(
                  option,
                )}: ${transform(value)} }, source: ${source} })`,
            ),
          )
        : null;
      return [nullaryMethod, unaryMethod, binaryMethod].filter(nonNull);
    },
  );
}

export function invertBooleanValue(value: Expression): Expression {
  return t.isBooleanLiteral(value) ? t.booleanLiteral(!value.value) : ast.expression`!${value}`;
}
