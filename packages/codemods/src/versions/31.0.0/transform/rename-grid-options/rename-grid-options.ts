import {
  AccessorKey,
  areLiteralsEqual,
  ast,
  createPropertyKey,
  createStaticPropertyKey,
  getLiteralPropertyKey,
  getLocatedPath,
  getNamedObjectLiteralStaticProperty,
  getOptionalNodeFieldValue,
  node as t,
  type AstCliContext,
  type AstNode,
  type AstTransform,
  type AstTransformContext,
  type NodePath,
  type Types,
} from '@ag-grid-devtools/ast';
import {
  Angular,
  BindingType,
  createAngularBooleanLiteral,
  createVueAstNode,
  createVueBooleanLiteral,
  createVueExpressionContainer,
  getAngularExpressionRoot,
  getAngularTemplateNodeChild,
  getFrameworkEventNames,
  getVueExpressionContainerExpression,
  getVueTemplateNodeChild,
  invertAngularBooleanExpression,
  invertVueBooleanExpression,
  isPropertyInitializerNode,
  isTypedAngularExpressionNode,
  isTypedAngularTemplateNode,
  isVueAttributeAttribute,
  isVueDirectiveAttribute,
  removeTemplateNode,
  replaceTemplateNode,
  SecurityContext,
  visitGridOptionsProperties,
  type AngularTemplateNode,
  type AST,
  type PropertyAccessorNode,
  type PropertyAssignmentNode,
  type PropertyInitializerNode,
  type VueTemplateNode,
  isTypedVueTemplateNode,
} from '@ag-grid-devtools/codemod-utils';
import { Enum, match, nonNull, unreachable } from '@ag-grid-devtools/utils';

type AssignmentExpression = Types.AssignmentExpression;
type Class = Types.Class;
type Expression = Types.Expression;
type Identifier = Types.Identifier;
type JSXAttribute = Types.JSXAttribute;
type JSXEmptyExpression = Types.JSXEmptyExpression;
type JSXElement = Types.JSXElement;
type JSXIdentifier = Types.JSXIdentifier;
type JSXNamespacedName = Types.JSXNamespacedName;
type Literal = Types.Literal;
type MemberExpression = Types.MemberExpression;
type ObjectExpression = Types.ObjectExpression;
type ObjectMethod = Types.ObjectMethod;
type ObjectProperty = Types.ObjectProperty;
type PrivateName = Types.PrivateName;

type VAttribute = AST.VAttribute;
type VDirective = AST.VDirective;
type VDirectiveKey = AST.VDirectiveKey;
type VElement = AST.VElement;
type VExpressionContainer = AST.VExpressionContainer;
type VLiteral = AST.VLiteral;

type ObjectPropertyNode = ObjectProperty | ObjectMethod;
type JsxPropertyNode = JSXAttribute;
type VuePropertyNode = VAttribute | VDirective;
type AngularPropertyNode =
  | Angular.TmplAstTextAttribute
  | Angular.TmplAstBoundAttribute
  | Angular.TmplAstBoundEvent;

type ObjectPropertyValue = NodePath<ObjectPropertyValueNode>;
type JsxPropertyValue = NodePath<JsxPropertyValueNode> | true;
type AngularPropertyValue = AngularPropertyValueNode | string;
type VuePropertyValue = VueTemplateNode<VuePropertyValueNode> | true;

type ObjectPropertyValueNode = Expression | ObjectMethod;
type JsxPropertyValueNode = Expression | JSXEmptyExpression;
type VuePropertyValueNode = VLiteral | VExpressionContainer;
type AngularPropertyValueNode = Angular.AST;

const MIGRATION_URL_V31 = 'https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-31/';

const GRID_OPTION_REPLACEMENTS = Object.entries({
  advancedFilterModel: migrateProperty(
    'initialState',
    transformOptionalValue(
      (() => {
        const warnings = frameworkWarning(
          getManualInterventionMessage('advancedFilterModel', MIGRATION_URL_V31),
        );
        return {
          property(value) {
            return transform(value);
          },
          jsxAttribute(value) {
            if (isNonNullJsxPropertyValue(value)) return transform(value);
            return null;
          },
          angularAttribute: warnings.angularAttribute,
          vueAttribute: warnings.vueAttribute,
        };
        function transform(value: ObjectPropertyValue): Expression {
          return ast.expression`{ filter: { advancedFilterModel: ${value.node} }}`;
        }
      })(),
    ),
  ),
  defaultExcelExportParams: transformPropertyValue(
    transformOptionalValue(
      (() => {
        const warnings = frameworkWarning(
          getManualInterventionMessage('advancedFilterModel', MIGRATION_URL_V31),
        );
        return {
          property(value) {
            if (!value.isExpression()) return value.node;
            return transform(value);
          },
          jsxAttribute(value) {
            if (isNonNullJsxPropertyValue(value)) return transform(value);
            return null;
          },
          angularAttribute: warnings.angularAttribute,
          vueAttribute: warnings.vueAttribute,
        };
        function transform(value: NodePath<Expression>): Expression {
          if (!value.isObjectExpression()) return value.node;
          const exportMode = getNamedObjectLiteralStaticProperty(value, 'exportMode');
          const suppressTextAsCDATA = getNamedObjectLiteralStaticProperty(
            value,
            'suppressTextAsCDATA',
          );
          if (!exportMode && !suppressTextAsCDATA) return value.node;
          return t.objectExpression(
            value.node.properties.filter((property) => {
              if (exportMode && property === exportMode.node) return false;
              if (suppressTextAsCDATA && property === suppressTextAsCDATA.node) return false;
              return true;
            }),
          );
        }
      })(),
    ),
  ),
  enableChartToolPanelsButton: migrateProperty(
    'suppressChartToolPanelsButton',
    invertOptionalBooleanValue(),
  ),
  enterMovesDown: migrateProperty('enterNavigatesVertically', migrateOptionalValue()),
  enterMovesDownAfterEdit: migrateProperty(
    'enterNavigatesVerticallyAfterEdit',
    migrateOptionalValue(),
  ),
  excludeHiddenColumnsFromQuickFilter: migrateProperty(
    'includeHiddenColumnsInQuickFilter',
    invertOptionalBooleanValue(),
  ),
  functionsPassive: removeProperty(getDeprecationMessage('functionsPassive', MIGRATION_URL_V31)),
  getServerSideStoreParams: migrateProperty(
    'getServerSideGroupLevelParams',
    migrateOptionalValue(),
  ),
  processSecondaryColDef: migrateProperty('processPivotResultColDef', migrateOptionalValue()),
  processSecondaryColGroupDef: migrateProperty(
    'processPivotResultColGroupDef',
    migrateOptionalValue(),
  ),
  rememberGroupStateWhenNewData: removeProperty(
    getDeprecationMessage('rememberGroupStateWhenNewData', MIGRATION_URL_V31),
  ),
  rowDataChangeDetectionStrategy: removeProperty(
    getDeprecationMessage('rowDataChangeDetectionStrategy', MIGRATION_URL_V31),
  ),
  serverSideFilterAllLevels: migrateProperty(
    'serverSideOnlyRefreshFilteredGroups',
    invertOptionalBooleanValue(),
  ),
  serverSideFilteringAlwaysResets: migrateProperty(
    'serverSideOnlyRefreshFilteredGroups',
    migrateOptionalValue(),
  ),
  serverSideSortingAlwaysResets: migrateProperty('serverSideSortAllLevels', migrateOptionalValue()),
  serverSideStoreType: migrateProperty(
    'suppressServerSideInfiniteScroll',
    transformOptionalValue(
      (() => {
        const warnings = frameworkWarning(
          getManualInterventionMessage('suppressServerSideInfiniteScroll', MIGRATION_URL_V31),
        );
        return {
          property(value) {
            return transformPropertyValue(value.node);
          },
          jsxAttribute(value, element, attribute, context) {
            if (value === true) return null;
            const { node } = value;
            if (t.isJSXEmptyExpression(node)) return null;
            return transformPropertyValue(node);
          },
          angularAttribute: warnings.angularAttribute,
          vueAttribute: warnings.vueAttribute,
        };
        function transformPropertyValue(value: Expression | ObjectMethod): Expression {
          if (t.isStringLiteral(value)) return t.booleanLiteral(value.value !== 'partial');
          if (!t.isExpression(value)) return t.booleanLiteral(false);
          return t.binaryExpression('!==', value, t.stringLiteral('partial'));
        }
      })(),
    ),
  ),
  suppressAggAtRootLevel: migrateProperty(
    'alwaysAggregateAtRootLevel',
    invertOptionalBooleanValue(),
  ),
  suppressAsyncEvents: removeProperty(
    getDeprecationMessage('suppressAsyncEvents', MIGRATION_URL_V31),
  ),
  suppressParentsInRowNodes: removeProperty(
    getDeprecationMessage('suppressParentsInRowNodes', MIGRATION_URL_V31),
  ),
  suppressReactUi: removeProperty(getDeprecationMessage('suppressReactUi', MIGRATION_URL_V31)),
  ...frameworkEvent('columnRowGroupChangeRequest', (eventName) =>
    removeProperty(getDeprecationMessage(eventName, MIGRATION_URL_V31)),
  ),
  ...frameworkEvent('columnPivotChangeRequest', (eventName) =>
    removeProperty(getDeprecationMessage(eventName, MIGRATION_URL_V31)),
  ),
  ...frameworkEvent('columnValueChangeRequest', (eventName) =>
    removeProperty(getDeprecationMessage(eventName, MIGRATION_URL_V31)),
  ),
  ...frameworkEvent('columnAggFuncChangeRequest', (eventName) =>
    removeProperty(getDeprecationMessage(eventName, MIGRATION_URL_V31)),
  ),
  ...frameworkEvent('rowDataChanged', (eventName) =>
    migrateProperty(
      eventName.replace(/changed$/, 'updated').replace(/Changed$/, 'Updated'),
      migrateOptionalValue(),
    ),
  ),
} as Record<string, ObjectPropertyTransformer<AstTransformContext<AstCliContext>>>).map(
  ([key, transform]) => ({
    accessor: { key: t.identifier(key), computed: false },
    transform,
  }),
);

function frameworkEvent<T>(key: string, factory: (frameworkKey: string) => T): Record<string, T> {
  return Object.fromEntries(
    Object.values(getFrameworkEventNames(key)).map((eventName) => [eventName, factory(eventName)]),
  );
}

function frameworkWarning<S extends AstTransformContext<AstCliContext>>(
  message: string,
): Omit<ObjectPropertyValueTransformer<S>, 'property'> {
  return {
    jsxAttribute(value, element, attribute, context) {
      context.opts.warn(attribute, message);
      return value === true ? value : value.node;
    },
    angularAttribute(value, component, element, attribute, context) {
      context.opts.warn(getLocatedPath(component) || component, message);
      return value;
    },
    vueAttribute(value, component, element, attribute, context) {
      context.opts.warn(getLocatedPath(component) || component, message);
      return value === true ? value : value.node;
    },
  };
}

function getDeprecationMessage(key: string, migrationUrl: string): string {
  return `The grid option "${key}" is deprecated. Please refer to the migration guide for more details: ${migrationUrl}`;
}

function getManualInterventionMessage(key: string, migrationUrl: string): string {
  return `The grid option "${key}" cannot be automatically migrated. Please refer to the migration guide for more details: ${migrationUrl}`;
}

const transform: AstTransform<AstCliContext> = {
  visitor: visitGridOptionsProperties({
    init(path, context) {
      const accessor = parseObjectPropertyInitializerAccessor(path);
      if (!accessor) return;
      // Iterate over each of the replacements until a match is found
      for (const { accessor: replacedAccessor, transform } of GRID_OPTION_REPLACEMENTS) {
        // Skip over any properties that do not match any of the defined replacement patterns
        if (!arePropertyAccessorsEqual(accessor, replacedAccessor)) continue;
        // If a match was found, apply the appropriate transformation
        transform.init(path, context);
        // Skip all other replacements
        break;
      }
    },
    get(path, context) {
      const accessor = parseObjectPropertyGetterAccessor(path);
      if (!accessor) return;
      // Iterate over each of the replacements until a match is found
      for (const { accessor: replacedAccessor, transform } of GRID_OPTION_REPLACEMENTS) {
        // Skip over any properties that do not match any of the defined replacement patterns
        if (!arePropertyAccessorsEqual(accessor, replacedAccessor)) continue;
        // If a match was found, apply the appropriate transformation
        transform.get(path, context);
        // Skip all other replacements
        break;
      }
    },
    set(path, context) {
      const accessor = parseObjectPropertyAssignmentAccessor(path);
      if (!accessor) return;
      // Iterate over each of the replacements until a match is found
      for (const { accessor: replacedAccessor, transform } of GRID_OPTION_REPLACEMENTS) {
        // Skip over any properties that do not match any of the defined replacement patterns
        if (!arePropertyAccessorsEqual(accessor, replacedAccessor)) continue;
        // If a match was found, apply the appropriate transformation
        transform.set(path, context);
        // Skip all other replacements
        break;
      }
    },
    jsxAttribute(path, element, context) {
      const accessor = parseJsxAttributeAccessor(path.node);
      if (!accessor) return;
      // Iterate over each of the replacements until a match is found
      for (const { accessor: replacedAccessor, transform } of GRID_OPTION_REPLACEMENTS) {
        // Skip over any properties that do not match any of the defined replacement patterns
        if (!arePropertyAccessorsEqual(accessor, replacedAccessor)) continue;
        // If a match was found, apply the appropriate transformation
        transform.jsxAttribute(path, element, context);
        // Skip all other replacements
        break;
      }
    },
    angularAttribute(attributeNode, component, element, context) {
      const accessor = parseAngularAttributeAccessor(attributeNode);
      // Iterate over each of the replacements until a match is found
      for (const { accessor: replacedAccessor, transform } of GRID_OPTION_REPLACEMENTS) {
        // Skip over any properties that do not match any of the defined replacement patterns
        if (!arePropertyAccessorsEqual(accessor, replacedAccessor)) continue;
        transform.angularAttribute(attributeNode, component, element, context);
        // Skip all other replacements
        break;
      }
    },
    vueAttribute(attributeNode, component, element, context) {
      const accessor = parseGridOptionVueAttributeAccessor(attributeNode.node);
      if (!accessor) return;
      // Iterate over each of the replacements until a match is found
      for (const { accessor: replacedAccessor, transform } of GRID_OPTION_REPLACEMENTS) {
        // Skip over any properties that do not match any of the defined replacement patterns
        if (!arePropertyAccessorsEqual(accessor, replacedAccessor)) continue;
        transform.vueAttribute(attributeNode, component, element, context);
        // Skip all other replacements
        break;
      }
    },
  }),
};

export default transform;

interface PropertyAccessor {
  key: Identifier | Literal | PrivateName | Expression;
  computed: boolean;
}

type ObjectPropertyTransformer<S> = {
  init(node: NodePath<PropertyInitializerNode>, context: S): void;
  get(node: NodePath<PropertyAccessorNode>, context: S): void;
  set(node: NodePath<PropertyAssignmentNode>, context: S): void;
  jsxAttribute(node: NodePath<JsxPropertyNode>, element: NodePath<JSXElement>, context: S): void;
  angularAttribute(
    attributeNode: AngularTemplateNode<AngularPropertyNode>,
    component: NodePath<Class>,
    element: AngularTemplateNode<Angular.TmplAstElement>,
    context: S,
  ): void;
  vueAttribute(
    templateNode: VueTemplateNode<VuePropertyNode>,
    component: NodePath<ObjectExpression>,
    element: VueTemplateNode<VElement>,
    context: S,
  ): void;
};

interface ObjectPropertyValueTransformer<S extends AstTransformContext<AstCliContext>> {
  property(
    value: ObjectPropertyValue,
    accessor: AccessorKey,
    context: S,
  ): ObjectPropertyValueNode | null;
  jsxAttribute(
    value: JsxPropertyValue,
    element: NodePath<JSXElement>,
    attribute: NodePath<JsxPropertyNode>,
    context: S,
  ): JsxPropertyValueNode | true | null;
  angularAttribute(
    value: AngularPropertyValue,
    component: NodePath<Class>,
    element: AngularTemplateNode<Angular.TmplAstElement>,
    attribute: AngularTemplateNode<AngularPropertyNode>,
    context: S,
  ): AngularPropertyValueNode | string | null;
  vueAttribute(
    value: VuePropertyValue,
    component: NodePath<ObjectExpression>,
    element: VueTemplateNode<VElement>,
    attribute: VueTemplateNode<VuePropertyNode>,
    context: S,
  ): VuePropertyValueNode | true | null;
}

type AngularProperty = Enum<{
  Text: {
    attribute: AngularTemplateNode<Angular.TmplAstTextAttribute>;
  };
  Bound: {
    attribute: AngularTemplateNode<Angular.TmplAstBoundAttribute>;
  };
  Event: {
    attribute: AngularTemplateNode<Angular.TmplAstBoundEvent>;
  };
}>;
const AngularProperty = Enum.create<AngularProperty>({
  Text: true,
  Bound: true,
  Event: true,
});

function parseAngularProperty(
  node: AngularTemplateNode<AngularPropertyNode>,
): AngularProperty | null {
  if (isTypedAngularTemplateNode(Angular.TmplAstTextAttribute, node)) {
    return AngularProperty.Text({ attribute: node });
  } else if (isTypedAngularTemplateNode(Angular.TmplAstBoundAttribute, node)) {
    return AngularProperty.Bound({ attribute: node });
  } else if (isTypedAngularTemplateNode(Angular.TmplAstBoundEvent, node)) {
    return AngularProperty.Event({ attribute: node });
  }
  return null;
}

function getAngularPropertyName(attribute: AngularProperty): string {
  return attribute.attribute.node.name;
}

function getAngularPropertyValue(attribute: AngularProperty): AngularPropertyValueNode | string {
  return match(attribute, {
    Text: ({ attribute }) => attribute.node.value,
    Bound: ({ attribute }) => attribute.node.value,
    Event: ({ attribute }) => attribute.node.handler,
  });
}

function getAngularPropertySourceSpan(attribute: AngularProperty): Angular.ParseSourceSpan {
  return match(attribute, {
    Text: ({ attribute }) => attribute.node.sourceSpan,
    Bound: ({ attribute }) => attribute.node.sourceSpan,
    Event: ({ attribute }) => attribute.node.sourceSpan,
  });
}

function getAngularPropertyKeySpan(
  attribute: AngularProperty,
): Angular.ParseSourceSpan | undefined {
  return match(attribute, {
    Text: ({ attribute }) => attribute.node.keySpan,
    Bound: ({ attribute }) => attribute.node.keySpan,
    Event: ({ attribute }) => attribute.node.keySpan,
  });
}

function getAngularPropertyValueSpan(
  attribute: AngularProperty,
): Angular.ParseSourceSpan | undefined {
  return match(attribute, {
    Text: ({ attribute }) => attribute.node.valueSpan,
    Bound: ({ attribute }) => attribute.node.valueSpan,
    Event: ({ attribute }) => attribute.node.handlerSpan,
  });
}

function getAngularPropertyI18n(
  attribute: AngularProperty,
): Angular.TmplAstTextAttribute['i18n'] | Angular.TmplAstBoundAttribute['i18n'] | undefined {
  return match(attribute, {
    Text: ({ attribute }) => attribute.node.i18n,
    Bound: ({ attribute }) => attribute.node.i18n,
    Event: ({ attribute }) => undefined,
  });
}

type VueProperty = Enum<{
  Attribute: {
    attribute: VueTemplateNode<VAttribute>;
  };
  Directive: {
    attribute: VueTemplateNode<VDirective>;
  };
}>;
const VueProperty = Enum.create<VueProperty>({
  Attribute: true,
  Directive: true,
});

function parseVueProperty(node: VueTemplateNode<VuePropertyNode>): VueProperty | null {
  const directiveAttribute = isVueDirectiveAttribute(node) ? node : null;
  const attributeAttribute = isVueAttributeAttribute(node) ? node : null;
  if (directiveAttribute) {
    return VueProperty.Directive({ attribute: directiveAttribute });
  } else if (attributeAttribute) {
    return VueProperty.Attribute({ attribute: attributeAttribute });
  }
  return null;
}

function getVuePropertyName(
  attribute: VueProperty,
): VueTemplateNode<VAttribute['key'] | VDirective['key']> {
  return match(attribute, {
    Attribute: ({ attribute }) => getVueTemplateNodeChild(attribute, 'key'),
    Directive: ({ attribute }) => getVueTemplateNodeChild(attribute, 'key'),
  });
}

function getVuePropertyValue(attribute: VueProperty): VuePropertyValue {
  return match(attribute, {
    Attribute: ({ attribute }) => getVueTemplateNodeChild(attribute, 'value') || true,
    Directive: ({ attribute }) => getVueTemplateNodeChild(attribute, 'value') || true,
  });
}

function parseObjectPropertyInitializerAccessor(
  property: NodePath<PropertyInitializerNode>,
): PropertyAccessor | null {
  switch (property.node.type) {
    case 'ObjectProperty': {
      const { key, computed } = property.node;
      return { key, computed };
    }
    case 'ObjectMethod': {
      const { key, computed } = property.node;
      return { key, computed };
    }
    default:
      unreachable(property.node);
  }
}

function parseObjectPropertyGetterAccessor(
  property: NodePath<PropertyAccessorNode>,
): PropertyAccessor | null {
  switch (property.node.type) {
    case 'Identifier': {
      return null;
    }
    case 'ObjectProperty': {
      const { key, computed } = property.node;
      return { key, computed };
    }
    case 'MemberExpression': {
      const { property: key, computed } = property.node;
      return { key, computed };
    }
    default:
      unreachable(property.node);
  }
}

function parseObjectPropertyAssignmentAccessor(
  property: NodePath<PropertyAssignmentNode>,
): PropertyAccessor | null {
  switch (property.node.type) {
    case 'AssignmentExpression': {
      const { left: target } = property.node;
      if (!t.isMemberExpression(target)) return null;
      const { property: key, computed } = target;
      return { key, computed };
    }
    default:
      unreachable(property.node.type);
  }
}

function parseNamedPropertyAccessor(accessor: AccessorKey): PropertyAccessor | null {
  return match(accessor, {
    Property: ({ name }) => ({ key: t.identifier(name), computed: false }),
    PrivateField: ({ name }) => ({ key: t.privateName(t.identifier(name)), computed: false }),
    Index: ({ index }) => ({ key: t.numericLiteral(index), computed: true }),
    Computed: ({ expression }) => ({ key: expression.node, computed: true }),
    // FIXME: support property renaming in object/array rest elements
    ObjectRest: ({}) => null,
    ArrayRest: ({}) => null,
  });
}

function parseGridOptionVueAttributeAccessor(
  attribute: VAttribute | VDirective,
): PropertyAccessor | null {
  if (attribute.directive) {
    const directiveType = attribute.key.name.name;
    if (directiveType === 'bind' || directiveType === 'on') {
      if (!attribute.key.argument) return null;
      if (attribute.key.argument.type !== 'VIdentifier') return null;
      return { key: t.identifier(attribute.key.argument.rawName), computed: false };
    }
    // FIXME: support Vue element event handler attributes
    return null;
  } else {
    return { key: t.identifier(attribute.key.rawName), computed: false };
  }
}

function transformPropertyValue<S extends AstTransformContext<AstCliContext>>(
  transform: ObjectPropertyValueTransformer<S>,
): ObjectPropertyTransformer<S> {
  return migrateProperty(null, transform);
}

function migrateProperty<S extends AstTransformContext<AstCliContext>>(
  targetKey: string | null,
  transform: ObjectPropertyValueTransformer<S>,
): ObjectPropertyTransformer<S> {
  const renamedAccessor =
    typeof targetKey === 'string' ? { key: t.identifier(targetKey), computed: false } : targetKey;
  const transformer: ObjectPropertyTransformer<S> = {
    init(path, context) {
      // Ensure this property is not transformed multiple times
      if (path.shouldSkip) return;
      path.skip();
      // If the property is being renamed to a new key that is already provided, remove the outdated property
      if (renamedAccessor && siblingPropertyInitializerExists(path, renamedAccessor)) {
        path.remove();
        return;
      }
      const property = renamedAccessor ? renameObjectProperty(path, renamedAccessor) : path;
      const propertyKey = { key: property.node.key, computed: property.node.computed };
      const accessor = createStaticPropertyKey(propertyKey.key, propertyKey.computed);
      const value = getPropertyInitializerValue(property);
      if (!accessor || !value) return;
      const updatedValue = value && transform.property(value, accessor, context);
      if (updatedValue === property.node) return;
      if (updatedValue === null) {
        path.remove();
      } else {
        rewriteObjectPropertyInitializer(property, propertyKey, updatedValue);
      }
    },
    get(path, context) {
      if (!renamedAccessor || path.isIdentifier()) return;
      // Ensure this property is not transformed multiple times
      if (path.shouldSkip) return;
      path.skip();
      if (path.isObjectProperty()) {
        const { value, decorators } = path.node;
        const { key, computed } = renamedAccessor;
        const shorthand = false;
        path.replaceWith(t.objectProperty(key, value, computed, shorthand, decorators));
      } else if (path.isMemberExpression()) {
        const object = path.get('object');
        const { key, computed } = renamedAccessor;
        const optional = false;
        path.replaceWith(t.memberExpression(object.node, key, computed, optional));
      }
    },
    set(path, context) {
      // Ensure this property is not transformed multiple times
      if (path.shouldSkip) return;
      path.skip();
      const assignment = renamedAccessor
        ? renameObjectPropertyAssignment(path, renamedAccessor)
        : path;
      const target = assignment.get('left');
      const key = target.get('property');
      const computed = target.node.computed;
      const accessor = createPropertyKey(key, computed);
      if (!accessor) return;
      const value = path.get('right');
      const updatedValue = transform.property(value, accessor, context);
      if (updatedValue === null) {
        removePropertyAssignment(path);
      } else {
        rewritePropertyAssignment(path, { key: key.node, computed }, updatedValue);
      }
    },
    jsxAttribute(path, element, context) {
      // Ensure this attribute is not transformed multiple times
      if (path.shouldSkip) return;
      path.skip();
      // If the attribute is being renamed to a new key that is already provided, remove the outdated attribute
      if (renamedAccessor && hasJsxElementAttribute(element, renamedAccessor)) {
        path.remove();
        return;
      }
      const originalValue = path.get('value');
      const value = parseJsxAttributeValue(originalValue);
      if (!value) return;
      const updatedValue = transform.jsxAttribute(value, element, path, context);
      if (updatedValue === null) {
        path.remove();
      } else {
        const attributeName = targetKey ? t.jsxIdentifier(targetKey) : path.get('name').node;
        const jsxValue = createJsxAttributeValue(updatedValue, originalValue);
        rewriteJsxAttribute(path, attributeName, jsxValue);
      }
    },
    angularAttribute(attributeNode, component, element, context) {
      // If the attribute is being renamed to a new key that is already provided, remove the outdated attribute
      if (targetKey && hasAngularElementAttribute(element, targetKey)) {
        removeTemplateNode(attributeNode);
        return;
      }
      // Rewrite the existing attribute
      const attribute = parseAngularProperty(attributeNode);
      if (!attribute) return;
      const value = getAngularPropertyValue(attribute);
      const updatedValue = transform.angularAttribute(
        value,
        component,
        element,
        attributeNode,
        context,
      );
      if (updatedValue === null) {
        removeTemplateNode(attributeNode);
      } else {
        const attributeName = targetKey || attributeNode.node.name;
        const updatedNode = getRewrittenAngularAttribute(attribute, attributeName, updatedValue);
        if (updatedNode !== attributeNode.node) replaceTemplateNode(attributeNode, updatedNode);
      }
    },
    vueAttribute(attributeNode, component, element, context) {
      // If the attribute is being renamed to a new key that is already provided, remove the outdated attribute
      if (targetKey && hasVueElementAttribute(element, targetKey)) {
        removeTemplateNode(attributeNode);
        return;
      }
      // Rewrite the existing attribute
      const attribute = parseVueProperty(attributeNode);
      if (!attribute) return;
      const value = getVuePropertyValue(attribute);
      const updatedValue = transform.vueAttribute(
        value,
        component,
        element,
        attributeNode,
        context,
      );
      if (updatedValue === null) {
        removeTemplateNode(attributeNode);
      } else {
        const attributeName = targetKey
          ? match(attribute, {
              Attribute: ({ attribute }) =>
                createVueAstNode({
                  type: 'VIdentifier',
                  name: targetKey,
                  rawName: targetKey,
                }),
              Directive: ({ attribute }) =>
                createVueAstNode({
                  type: 'VDirectiveKey',
                  name: attribute.node.key.name,
                  argument: createVueAstNode({
                    type: 'VIdentifier',
                    name: targetKey,
                    rawName: targetKey,
                  }),
                  modifiers: attribute.node.key.modifiers,
                }),
            })
          : attributeNode.node.key;
        const updatedNode = getRewrittenVueAttribute(attribute, attributeName, updatedValue);
        if (updatedNode !== attributeNode.node) replaceTemplateNode(attributeNode, updatedNode);
      }
    },
  };
  return transformer;
}

function removeProperty(
  deprecationWarning: string,
): ObjectPropertyTransformer<AstTransformContext<AstCliContext>> {
  return {
    init(path, context) {
      // Ensure this property is not transformed multiple times
      if (path.shouldSkip) return;
      path.skip();
      if (!context.opts.applyDangerousEdits) {
        context.opts.warn(path, deprecationWarning);
        return;
      }
      path.remove();
    },
    get(path, context) {
      // Ensure this property is not transformed multiple times
      if (path.shouldSkip) return;
      path.skip();
      if (!context.opts.applyDangerousEdits) {
        context.opts.warn(path, deprecationWarning);
        return;
      }
      path.replaceWith(t.identifier('undefined'));
    },
    set(path, context) {
      // Ensure this property is not transformed multiple times
      if (path.shouldSkip) return;
      path.skip();
      if (!context.opts.applyDangerousEdits) {
        context.opts.warn(path, deprecationWarning);
        return;
      }
      removePropertyAssignment(path);
    },
    jsxAttribute(path, element, context) {
      // Ensure this property is not transformed multiple times
      if (path.shouldSkip) return;
      path.skip();
      if (!context.opts.applyDangerousEdits) {
        context.opts.warn(path, deprecationWarning);
        return;
      }
      path.remove();
    },
    angularAttribute(attributeNode, component, element, context) {
      if (!context.opts.applyDangerousEdits) {
        // FIXME: show Angular template element location in deprecation warnings
        context.opts.warn(null, deprecationWarning);
        return;
      }
      removeTemplateNode(attributeNode);
    },
    vueAttribute(attributeNode, component, element, context) {
      if (!context.opts.applyDangerousEdits) {
        // FIXME: show Vue template element location in deprecation warnings
        context.opts.warn(null, deprecationWarning);
        return;
      }
      removeTemplateNode(attributeNode);
    },
  };
}

function migrateOptionalValue<
  S extends AstTransformContext<AstCliContext>,
>(): ObjectPropertyValueTransformer<S> {
  return transformOptionalValue<S>({
    property(value, accessor, context) {
      return value.node;
    },
    jsxAttribute(value, element, attribute, context) {
      return value === true ? value : value.node;
    },
    angularAttribute(value, component, element, attribute, context) {
      return value;
    },
    vueAttribute(value, component, element, attribute, context) {
      return value === true ? value : value.node;
    },
  });
}

function transformOptionalValue<S extends AstTransformContext<AstCliContext>>(
  transform: ObjectPropertyValueTransformer<S>,
): ObjectPropertyValueTransformer<S> {
  return {
    property(value, accessor, context) {
      if (value.isNullLiteral() || isUndefinedLiteral(value)) return value.node;
      return transform.property(value, accessor, context);
    },
    jsxAttribute(value, element, attribute, context) {
      if (isNullJsxAttributeValue(value)) return value === true ? value : value.node;
      if (
        value !== true &&
        (value.isJSXEmptyExpression() || value.isNullLiteral() || isUndefinedLiteral(value))
      ) {
        return value.node;
      }
      return transform.jsxAttribute(value, element, attribute, context);
    },
    angularAttribute(value, component, element, attribute, context) {
      if (isNullAngularAttributeValue(value)) {
        return value;
      }
      return transform.angularAttribute(value, component, element, attribute, context);
    },
    vueAttribute(value, component, element, attribute, context) {
      if (isNullVueAttributeValue(value)) return value === true ? value : value.node;
      return transform.vueAttribute(value, component, element, attribute, context);
    },
  };
}

function isNullJsxAttributeValue(value: JsxPropertyValue): boolean {
  if (value === true) return false;
  return value.isJSXEmptyExpression() || value.isNullLiteral() || isUndefinedLiteral(value);
}

function isNullAngularAttributeValue(value: AngularPropertyValueNode | string): boolean {
  if (typeof value === 'string') return false;
  const expression = getAngularExpressionRoot(value);
  return (
    isTypedAngularExpressionNode(Angular.LiteralPrimitive, expression) && expression.value == null
  );
}

function isNullVueAttributeValue(value: VuePropertyValue): boolean {
  if (value === true) return false;
  if (!isTypedVueTemplateNode('VExpressionContainer', value)) return false;
  const expression = getVueTemplateNodeChild(value, 'expression');
  if (!expression) return true;
  return (
    (isTypedVueTemplateNode('Literal', expression) && expression.node.value == null) ||
    (isTypedVueTemplateNode('Identifier', expression) && expression.node.name == 'undefined')
  );
}

function invertOptionalBooleanValue<
  S extends AstTransformContext<AstCliContext>,
>(): ObjectPropertyValueTransformer<S> {
  return transformOptionalValue<S>({
    property(value, accessor, context) {
      const { node } = value;
      if (t.isObjectMethod(node)) return t.booleanLiteral(false);
      return invertBooleanExpressionNode(node);
    },
    jsxAttribute(value, element, attribute, context) {
      if (value === true) return t.booleanLiteral(false);
      const { node } = value;
      if (t.isJSXEmptyExpression(node)) return t.booleanLiteral(true);
      return invertBooleanExpressionNode(node);
    },
    angularAttribute(value, component, element, attribute, context) {
      if (typeof value === 'string') return createAngularBooleanLiteral(false);
      return invertAngularBooleanExpression(value);
    },
    vueAttribute(value, component, element, attribute, context) {
      const invertedValue =
        value === true
          ? createVueBooleanLiteral(false)
          : value.node.type === 'VLiteral'
          ? createVueBooleanLiteral(value.node.value !== '')
          : (() => {
              const expression = getVueExpressionContainerExpression(value.node);
              if (!expression) return null;
              return invertVueBooleanExpression(expression);
            })();
      if (!invertedValue) {
        context.opts.warn(
          component,
          `Unable to invert Vue attribute value: ${formatVueAttributeName(attribute.node)}`,
        );
      }
      return createVueExpressionContainer(invertedValue);
    },
  });
}

function invertBooleanExpressionNode(node: Expression): Expression {
  const literalValue = getBooleanLiteralExpressionValue(node);
  if (typeof literalValue === 'boolean') return t.booleanLiteral(!literalValue);
  return t.unaryExpression('!', node);
}

function getBooleanLiteralExpressionValue(node: t.Expression): boolean | null {
  if (t.isNullLiteral(node) || isUndefinedLiteralNode(node)) return false;
  if (t.isBooleanLiteral(node)) return node.value;
  if (t.isStringLiteral(node)) return node.value !== '';
  if (t.isNumericLiteral(node)) return node.value !== 0;
  return null;
}

function siblingPropertyInitializerExists(
  property: NodePath<PropertyInitializerNode>,
  accessor: PropertyAccessor,
): boolean {
  if (!property.parentPath.isObjectExpression()) return false;
  return property.parentPath
    .get('properties')
    .map((existingProperty) => {
      if (!isPropertyInitializerNode(existingProperty)) return null;
      return parseObjectPropertyInitializerAccessor(existingProperty);
    })
    .filter(nonNull)
    .some((existingAccessor) => arePropertyAccessorsEqual(accessor, existingAccessor));
}

function hasJsxElementAttribute(
  element: NodePath<JSXElement>,
  accessor: PropertyAccessor,
): boolean {
  return element
    .get('openingElement')
    .get('attributes')
    .map((attribute) => {
      if (!attribute.isJSXAttribute()) return null;
      return parseJsxAttributeAccessor(attribute.node);
    })
    .filter(nonNull)
    .some((existingAccessor) => arePropertyAccessorsEqual(accessor, existingAccessor));
}

function parseJsxAttributeAccessor(attribute: JSXAttribute): PropertyAccessor {
  const { name: key } = attribute;
  if (t.isJSXNamespacedName(key)) {
    const { namespace, name } = key;
    return {
      key: t.memberExpression(t.identifier(namespace.name), t.identifier(name.name)),
      computed: true,
    };
  }
  return { key: t.identifier(key.name), computed: false };
}

function parseAngularAttributeAccessor(
  attribute: AngularTemplateNode<
    Angular.TmplAstTextAttribute | Angular.TmplAstBoundAttribute | Angular.TmplAstBoundEvent
  >,
): PropertyAccessor {
  return { key: t.identifier(attribute.node.name), computed: false };
}

function getDynamicPropertyAssignmentTarget(
  path: NodePath<AssignmentExpression>,
): NodePath<Expression> | null {
  const target = path.get('left');
  if (!target.isMemberExpression()) return null;
  return target.get('object');
}

function arePropertyAccessorsEqual(left: PropertyAccessor, right: PropertyAccessor): boolean {
  if (!left.computed && t.isIdentifier(left.key)) {
    if (!right.computed && t.isIdentifier(right.key)) return left.key.name === right.key.name;
    if (t.isLiteral(right.key)) return getLiteralPropertyKey(right.key) === left.key.name;
    return false;
  }
  if (!right.computed && t.isIdentifier(right.key)) {
    if (!left.computed && t.isIdentifier(left.key)) return right.key.name === left.key.name;
    if (t.isLiteral(left.key)) return getLiteralPropertyKey(left.key) === right.key.name;
    return false;
  }
  if (t.isLiteral(left.key) && t.isLiteral(right.key)) {
    return getLiteralPropertyKey(left.key) === getLiteralPropertyKey(right.key);
  }
  return false;
}

function getPropertyInitializerValue(
  property: NodePath<PropertyInitializerNode>,
): NodePath<ObjectPropertyValueNode> | null {
  if (property.isObjectProperty()) {
    const value = property.get('value');
    if (value.isExpression()) return value;
    return null;
  } else if (property.isObjectMethod()) {
    return property;
  } else {
    return null;
  }
}

function renameObjectProperty(
  property: NodePath<ObjectPropertyNode>,
  targetAccessor: PropertyAccessor,
): NodePath<ObjectPropertyNode> {
  if (
    property.node.key === targetAccessor.key &&
    property.node.computed === targetAccessor.computed
  ) {
    return property;
  }
  const { node } = property;
  const value = t.isObjectMethod(node) ? node : t.isExpression(node.value) ? node.value : null;
  if (!value) return property;
  return rewriteObjectPropertyInitializer(property, targetAccessor, value);
}

function rewriteObjectPropertyInitializer(
  property: NodePath<ObjectPropertyNode>,
  targetAccessor: PropertyAccessor,
  value: ObjectPropertyValueNode,
): NodePath<ObjectPropertyNode> {
  const { key, computed } = targetAccessor;
  if (t.isObjectMethod(value)) {
    if (t.isPrivateName(key)) {
      const [transformed] = property.replaceWith(
        t.objectProperty(key, getObjectPropertyValueExpressionNode(value), computed),
      );
      return transformed;
    } else {
      const { kind, params, body, computed, generator, async } = value;
      const [transformed] = property.replaceWith(
        t.objectMethod(kind, key, params, body, computed, generator, async),
      );
      return transformed;
    }
  } else {
    const shorthand = property.isObjectProperty() ? property.node.shorthand : undefined;
    const decorators = property.node.decorators;
    const [transformed] = property.replaceWith(
      t.objectProperty(key, value, computed, shorthand, decorators),
    );
    return transformed;
  }
}

function renameObjectPropertyAssignment(
  assignment: NodePath<PropertyAssignmentNode>,
  targetAccessor: PropertyAccessor,
): NodePath<PropertyAssignmentNode> {
  const existingTarget = assignment.get('left');
  const existingKey = existingTarget.get('property');
  if (
    existingKey === targetAccessor.key &&
    existingTarget.node.computed === targetAccessor.computed
  ) {
    return assignment;
  }
  const [updatedKey] =
    existingKey !== targetAccessor.key
      ? existingKey.replaceWith(targetAccessor.key)
      : [existingKey];
  const [updatedTarget] = existingTarget.replaceWith(
    t.memberExpression(existingTarget.node.object, updatedKey.node, targetAccessor.computed),
  );
  const [transformed] = assignment.replaceWith(
    t.assignmentExpression(assignment.node.operator, updatedTarget.node, assignment.node.right),
  );
  return transformed as NodePath<
    AssignmentExpression & {
      left: MemberExpression;
    }
  >;
}

function rewritePropertyAssignment(
  property: NodePath<PropertyAssignmentNode>,
  targetAccessor: PropertyAccessor,
  value: ObjectPropertyValueNode,
): void {
  const existingTarget = property.get('left');
  const { key, computed } = targetAccessor;
  const updatedTarget =
    key === existingTarget.node.property && computed === existingTarget.node.computed
      ? existingTarget.node
      : t.memberExpression(existingTarget.node.object, key, computed);
  property.replaceWith(
    t.assignmentExpression(
      property.node.operator,
      updatedTarget,
      getObjectPropertyValueExpressionNode(value),
    ),
  );
}

function rewriteJsxAttribute(
  attribute: NodePath<JsxPropertyNode>,
  attributeName: JSXIdentifier | JSXNamespacedName,
  value: JSXAttribute['value'],
): NodePath<JsxPropertyNode> {
  const namesAreEqual = jsxAttributeNamesAreEqual(attribute.node.name, attributeName);
  const valuesAreEqual = jsxAttributeValuesAreEqual(attribute.node.value, value);
  if (namesAreEqual && valuesAreEqual) return attribute;
  const existingName = attribute.get('name');
  const existingValue = getOptionalNodeFieldValue(attribute.get('value'));
  const updatedName = namesAreEqual ? existingName : existingName.replaceWith(attributeName)[0];
  const updatedValue = valuesAreEqual ? existingValue && existingValue.node : value;
  const [transformed] = attribute.replaceWith(t.jsxAttribute(updatedName.node, updatedValue));
  return transformed;
}

function jsxAttributeNamesAreEqual(
  left: JSXIdentifier | JSXNamespacedName,
  right: JSXIdentifier | JSXNamespacedName,
): boolean {
  if (t.isJSXIdentifier(left) && t.isJSXIdentifier(right)) {
    return left.name === right.name;
  } else if (t.isJSXNamespacedName(left) && t.isJSXNamespacedName(right)) {
    return left.namespace.name === right.namespace.name && left.name.name === right.name.name;
  } else {
    return false;
  }
}

function jsxAttributeValuesAreEqual(
  left: JSXAttribute['value'],
  right: JSXAttribute['value'],
): boolean {
  if (left === right) return true;
  if (!left || !right) {
    return !left && !right;
  } else if (t.isJSXExpressionContainer(left) || t.isJSXExpressionContainer(right)) {
    const leftValue = t.isJSXExpressionContainer(left) ? left.expression : left;
    const rightValue = t.isJSXExpressionContainer(right) ? right.expression : right;
    if (leftValue === rightValue) return true;
    if (t.isJSXEmptyExpression(leftValue)) return t.isJSXEmptyExpression(rightValue);
    if (t.isJSXEmptyExpression(rightValue)) return t.isJSXEmptyExpression(leftValue);
    if (t.isLiteral(leftValue) && t.isLiteral(rightValue)) {
      return areLiteralsEqual(leftValue, rightValue);
    }
    return false;
  } else if (t.isStringLiteral(left) && t.isStringLiteral(right)) {
    return left.value === right.value;
  } else {
    return left === right;
  }
}

function getObjectPropertyValueExpressionNode(value: ObjectPropertyValueNode): Expression {
  if (t.isObjectMethod(value)) {
    const { key, params, body, computed, generator, async } = value;
    const id = !computed && t.isIdentifier(key) ? key : null;
    return t.functionExpression(id, params, body, generator, async);
  }
  return value;
}

function removePropertyAssignment(property: NodePath<PropertyAssignmentNode>): void {
  const parentPath = property.parentPath;
  if (parentPath && parentPath.isExpressionStatement()) {
    property.parentPath.remove();
  } else {
    property.replaceWith(t.identifier('undefined'));
  }
}

function isUndefinedLiteral(path: NodePath<AstNode>): path is NodePath<Identifier> {
  return isUndefinedLiteralNode(path.node);
}

function isUndefinedLiteralNode(node: AstNode): node is Identifier {
  return t.isIdentifier(node) && node.name === 'undefined';
}

function parseJsxAttributeValue(value: NodePath<JSXAttribute['value']>): JsxPropertyValue | null {
  const attributeValue = getOptionalNodeFieldValue(value);
  if (!attributeValue) return true;
  if (attributeValue.isJSXExpressionContainer()) return attributeValue.get('expression');
  if (attributeValue.isExpression()) return attributeValue;
  return null;
}

function isNonNullJsxPropertyValue(
  node: JsxPropertyValue,
): node is NodePath<Exclude<Exclude<JsxPropertyValue, true>['node'], JSXEmptyExpression>> {
  if (node === true || node.isJSXEmptyExpression()) return false;
  return true;
}

function createJsxAttributeValue(
  value: JsxPropertyValueNode | true,
  existingValue: NodePath<JSXAttribute['value']>,
): JSXAttribute['value'] {
  if (value === true) return null;
  if (t.isStringLiteral(value) && existingValue.isStringLiteral()) return value;
  if (t.isJSXElement(value) && (existingValue.isJSXElement() || existingValue.isJSXFragment())) {
    return value;
  }
  if (t.isJSXFragment(value) && (existingValue.isJSXElement() || existingValue.isJSXFragment())) {
    return value;
  }
  return t.jsxExpressionContainer(value);
}

function hasAngularElementAttribute(
  element: AngularTemplateNode<Angular.TmplAstElement>,
  attributeName: string,
) {
  const attributes = [
    ...getAngularTemplateNodeChild(element, 'attributes'),
    ...getAngularTemplateNodeChild(element, 'inputs'),
    ...getAngularTemplateNodeChild(element, 'outputs'),
  ];
  return attributes.some((attribute) => attribute.node.name === attributeName);
}

function getRewrittenAngularAttribute(
  attribute: AngularProperty,
  attributeName: string,
  updatedValue: string | Angular.AST,
): AngularPropertyNode {
  const existingName = getAngularPropertyName(attribute);
  const existingValue = getAngularPropertyValue(attribute);
  const nameHasChanged = attributeName !== existingName;
  const valueHasChanged = updatedValue !== existingValue;
  if (!nameHasChanged && !valueHasChanged) return attribute.attribute.node;
  if (typeof updatedValue === 'string') {
    const sourceSpan = getAngularPropertySourceSpan(attribute);
    const keySpan = getAngularPropertyKeySpan(attribute);
    const valueSpan = getAngularPropertyValueSpan(attribute);
    const i18n = getAngularPropertyI18n(attribute);
    return new Angular.TmplAstTextAttribute(
      attributeName,
      updatedValue,
      sourceSpan,
      keySpan,
      valueSpan,
      i18n,
    );
  }
  return match(attribute, {
    Text: ({ attribute }) => {
      return new Angular.TmplAstBoundAttribute(
        attributeName,
        BindingType.Attribute as number as Angular.BindingType,
        SecurityContext.NONE as Angular.core.SecurityContext,
        updatedValue,
        null,
        attribute.node.sourceSpan,
        undefined!,
        undefined,
        attribute.node.i18n,
      );
    },
    Bound: ({ attribute }) => {
      const { type, securityContext, unit, sourceSpan, keySpan, valueSpan, i18n } = attribute.node;
      return new Angular.TmplAstBoundAttribute(
        attributeName,
        type,
        securityContext,
        updatedValue,
        unit,
        sourceSpan,
        keySpan,
        valueSpan,
        i18n,
      );
    },
    Event: ({ attribute }) => {
      const { type, target, phase, sourceSpan, handlerSpan, keySpan } = attribute.node;
      return new Angular.TmplAstBoundEvent(
        attributeName,
        type,
        updatedValue,
        target,
        phase,
        sourceSpan,
        handlerSpan,
        keySpan,
      );
    },
  });
}

function hasVueElementAttribute(element: VueTemplateNode<VElement>, attributeName: string) {
  const startTag = getVueTemplateNodeChild(element, 'startTag');
  const attributes = getVueTemplateNodeChild(startTag, 'attributes');
  return attributes.some((attribute) => attribute.node.key.name === attributeName);
}

function getRewrittenVueAttribute(
  attribute: VueProperty,
  attributeName: VAttribute['key'] | VDirective['key'],
  updatedValue: VuePropertyValueNode | true,
): VuePropertyNode {
  const existingName = getVuePropertyName(attribute);
  const existingValue = getVuePropertyValue(attribute);
  const nameHasChanged = attributeName !== existingName.node;
  const valueHasChanged =
    updatedValue !== (existingValue === true ? existingValue : existingValue.node);
  if (!nameHasChanged && !valueHasChanged) return attribute.attribute.node;
  return match(attribute, {
    Attribute: ({ attribute }) => {
      const { type, directive, key } = attribute.node;
      return createVueAstNode({
        type,
        directive,
        key: nameHasChanged ? attributeName : key,
        value: valueHasChanged
          ? updatedValue === true
            ? null
            : updatedValue
          : existingValue === true
          ? null
          : existingValue.node,
      });
    },
    Directive: ({ attribute }) => {
      const { type, directive, key } = attribute.node;
      return createVueAstNode({
        type,
        directive,
        key: nameHasChanged ? attributeName : key,
        value: valueHasChanged
          ? updatedValue === true
            ? null
            : updatedValue
          : existingValue === true
          ? null
          : existingValue.node,
      });
    },
  });
}

function formatVueAttributeName(attribute: VuePropertyNode): string {
  if (attribute.directive) {
    return formatVueDirectiveName(attribute.key);
  } else {
    return attribute.key.name;
  }
}

function formatVueDirectiveName(key: VDirectiveKey): string {
  if (!key.argument) return key.name.name;
  return `${key.name.name}:${key.argument.type === 'VIdentifier' ? key.argument.name : '[..]'}`;
}
