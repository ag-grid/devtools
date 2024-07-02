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
  NodePath,
  AstTransformContext,
} from '@ag-grid-devtools/ast';
import { isGridApiReference } from '@ag-grid-devtools/codemod-utils';
import { VueComponentCliContext } from '@ag-grid-devtools/codemod-utils/src/transform';
import { nonNull } from '@ag-grid-devtools/utils';

type Expression = Types.Expression;
type ContextInput = AstTransformContext<AstCliContext & VueComponentCliContext>;

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
  return function transformGridApiMethods(babel) {
    function CallExpression(path: NodePath, context: ContextInput) {
      // Iterate over each of the replacements until a match is found
      for (const replacement of replacements) {
        // Attempt to apply the replacement to the current AST node, skipping if the node doesn't match this pattern
        const result = replacement.exec(path);
        if (!result) continue;

        // If this is an incidental match (naming collision with an identically-named user method), skip the replacement
        const { node, refs } = result;
        if (!isGridApiReference(refs.api, context)) continue;

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
        if (!isGridApiReference(api, context)) continue;

        context.opts.fail(path, 'This method has been deprecated');

        // Prevent this node from being repeatedly transformed
        path.skip();
      }
    }

    return {
      visitor: {
        // Transform deprecated Grid API method invocations
        CallExpression,
        OptionalCallExpression: CallExpression,
      },
    };
  };
}

export function getGridOptionSetterReplacements(
  options: Record<string, GridOptionSetterReplacementDefinition>,
): Array<GridApiReplacement> {
  return Object.entries(options).flatMap(
    ([method, { option, optionalValue, transformValue, allowCustomSource }]) => {
      const result: Array<GridApiReplacement> = [];

      const transform = transformValue || ((value: Expression) => value);

      for (const apiOptionalChaining of ['', '?', '!']) {
        // Generate a zero-arg method replacement if method's value is optional
        if (optionalValue) {
          result.push(
            replace(
              matchNode(
                ({ api }) => ast.expression`${api}${apiOptionalChaining}.${t.identifier(method)}()`,
                {
                  api: p.expression(),
                },
              ),
              template(
                ({ api }) =>
                  ast.expression`${api}${apiOptionalChaining}.setGridOption(${t.stringLiteral(
                    option,
                  )}, undefined)`,
              ),
            ),
          );
        }

        // Generate a one-arg method replacement for all replaced methods
        result.push(
          replace(
            matchNode(
              ({ api, value }) =>
                ast.expression`${api}${apiOptionalChaining}.${t.identifier(method)}(${value})`,
              {
                api: p.expression(),
                value: p.expression(),
              },
            ),
            template(
              ({ api, value }) =>
                ast.expression`${api}${apiOptionalChaining}.setGridOption(${t.stringLiteral(
                  option,
                )}, ${transform(value)})`,
            ),
          ),
        );

        if (allowCustomSource) {
          result.push(
            replace(
              matchNode(
                ({ api, value, source }) =>
                  ast.expression`${api}${apiOptionalChaining}.${t.identifier(method)}(${value}, ${source})`,
                {
                  api: p.expression(),
                  value: p.expression(),
                  source: p.expression(),
                },
              ),
              template(
                ({ api, value, source }) =>
                  ast.expression`${api}${apiOptionalChaining}.updateGridOptions({ options: { ${t.identifier(
                    option,
                  )}: ${transform(value)} }, source: ${source} })`,
              ),
            ),
          );
        }
      }

      return result;
    },
  );
}

export function invertBooleanValue(value: Expression): Expression {
  return t.isBooleanLiteral(value) ? t.booleanLiteral(!value.value) : ast.expression`!${value}`;
}
