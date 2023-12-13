import {
  ast,
  getLiteralPropertyKey,
  node as t,
  AccessorKey,
  type AstNode,
  type AstTransform,
  type AstTransformContext,
  type NodePath,
  type Types,
  getNamedObjectLiteralStaticProperty,
  AstCliContext,
} from '@ag-grid-devtools/ast';
import {
  createVueAstNode,
  getFrameworkEventNames,
  getVueTemplateNodeChild,
  isPropertyAssignmentNode,
  isPropertyInitializerNode,
  isVueDirectiveAttribute,
  removeVueTemplateNode,
  replaceVueTemplateNode,
  visitGridOptionsProperties,
  type AST,
  type PropertyAccessorNode,
  type PropertyAssignmentNode,
  type PropertyInitializerNode,
  type VueTemplateNode,
} from '@ag-grid-devtools/codemod-utils';
import { match, nonNull, unreachable } from '@ag-grid-devtools/utils';

type AssignmentExpression = Types.AssignmentExpression;
type Expression = Types.Expression;
type Identifier = Types.Identifier;
type JSXAttribute = Types.JSXAttribute;
type JSXEmptyExpression = Types.JSXEmptyExpression;
type Literal = Types.Literal;
type ObjectExpression = Types.ObjectExpression;
type ObjectMethod = Types.ObjectMethod;
type PrivateName = Types.PrivateName;

type VAttribute = AST.VAttribute;
type VDirective = AST.VDirective;

interface JsxBooleanShorthandAttribute extends JSXAttribute {
  value?: undefined | null;
}

type PropertyValueNode =
  | Expression
  | ObjectMethod
  | JsxBooleanShorthandAttribute
  | JSXEmptyExpression;

function isPropertyValueNode(path: NodePath<AstNode>): path is NodePath<PropertyValueNode> {
  return (
    path.isExpression() ||
    path.isObjectMethod() ||
    (path.isJSXAttribute() && !path.node.value) ||
    path.isJSXEmptyExpression()
  );
}

const MIGRATION_URL_V31 = 'https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/';

const GRID_OPTION_REPLACEMENTS = Object.entries({
  advancedFilterModel: migrateProperty(
    'initialState',
    transformOptionalValue(
      (value) => ast.expression`{ filter: { advancedFilterModel: ${value.node} }}`,
    ),
  ),
  defaultExcelExportParams: transformPropertyValue(
    transformOptionalValue((value) => {
      if (!value.isObjectExpression()) return value.node;
      const exportMode = getNamedObjectLiteralStaticProperty(value, 'exportMode');
      const suppressTextAsCDATA = getNamedObjectLiteralStaticProperty(value, 'suppressTextAsCDATA');
      if (!exportMode && !suppressTextAsCDATA) return value.node;
      return t.objectExpression(
        value.node.properties.filter((property) => {
          if (exportMode && property === exportMode.node) return false;
          if (suppressTextAsCDATA && property === suppressTextAsCDATA.node) return false;
          return true;
        }),
      );
    }),
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
    transformOptionalValue((value) => {
      if (value.isStringLiteral()) return t.booleanLiteral(value.node.value !== 'partial');
      if (!value.isExpression()) return t.booleanLiteral(false);
      return t.binaryExpression('!==', value.node, t.stringLiteral('partial'));
    }),
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
    migrateProperty(eventName.replace(/Changed$/, 'Updated'), migrateOptionalValue()),
  ),
} as Record<string, PropertyTransformer<AstTransformContext<AstCliContext>>>).map(
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

function getDeprecationMessage(key: string, migrationUrl: string): string {
  return `The grid option "${key}" is deprecated. Please refer to the migration guide for more details: ${migrationUrl}`;
}

const transform: AstTransform<AstCliContext> = {
  visitor: visitGridOptionsProperties({
    init(path, context) {
      const accessor = parseGridOptionInitializerAccessor(path);
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
      const accessor = parseGridOptionGetterAccessor(path);
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
      const accessor = parseGridOptionAssignmentAccessor(path);
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
    initNamedProperty(key, path, context) {
      const accessor = parseNamedPropertyAccessor(key);
      if (!accessor) return;
      // Iterate over each of the replacements until a match is found
      for (const { accessor: replacedAccessor, transform } of GRID_OPTION_REPLACEMENTS) {
        // Skip over any properties that do not match any of the defined replacement patterns
        if (!arePropertyAccessorsEqual(accessor, replacedAccessor)) continue;
        // If a match was found, apply the appropriate transformation
        if (isPropertyValueNode(path)) transform.value(path, context);
        // Skip all other replacements
        break;
      }
    },
    jsxAttribute(path, context) {
      const accessor = parseJsxAttributeAccessor(path.node);
      if (!accessor) return;
      // Iterate over each of the replacements until a match is found
      for (const { accessor: replacedAccessor, transform } of GRID_OPTION_REPLACEMENTS) {
        // Skip over any properties that do not match any of the defined replacement patterns
        if (!arePropertyAccessorsEqual(accessor, replacedAccessor)) continue;
        // If a match was found, apply the appropriate transformation
        transform.jsxAttribute(path, context);
        // Skip all other replacements
        break;
      }
    },
    vueAttribute(templateNode, component, context) {
      const accessor = parseGridOptionVueAttributeAccessor(templateNode.node);
      if (!accessor) return;
      // Iterate over each of the replacements until a match is found
      for (const { accessor: replacedAccessor, transform } of GRID_OPTION_REPLACEMENTS) {
        // Skip over any properties that do not match any of the defined replacement patterns
        if (!arePropertyAccessorsEqual(accessor, replacedAccessor)) continue;
        transform.vueAttribute(templateNode, component, context);
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

type PropertyTransformer<S> = {
  init(node: NodePath<PropertyInitializerNode>, context: S): void;
  get(node: NodePath<PropertyAccessorNode>, context: S): void;
  set(node: NodePath<PropertyAssignmentNode>, context: S): void;
  jsxAttribute(node: NodePath<JSXAttribute>, context: S): void;
  value(node: NodePath<PropertyValueNode>, context: S): void;
  vueAttribute(
    templateNode: VueTemplateNode<VAttribute | VDirective>,
    component: NodePath<ObjectExpression>,
    context: S,
  ): void;
};

function parseGridOptionInitializerAccessor(
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

function parseGridOptionGetterAccessor(
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

function parseGridOptionAssignmentAccessor(
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
    if (attribute.key.name.name === 'bind') {
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

interface PropertyValueTransformer {
  (value: NodePath<PropertyValueNode>): PropertyValueNode | null;
}

function transformPropertyValue<AstTransformContext>(
  transform: PropertyValueTransformer,
): PropertyTransformer<AstTransformContext> {
  const transformer: PropertyTransformer<AstTransformContext> = {
    init(path, context) {
      if (path.shouldSkip) return;
      const value = getPropertyInitializerValue(path);
      const updatedValue = value && transform(value);
      if (updatedValue) {
        const key = path.get('key').node;
        const computed = path.node.computed;
        rewritePropertyInitializer(path, { key, computed }, updatedValue);
      } else {
        path.remove();
      }
      path.skip();
    },
    get(path, context) {
      return;
    },
    set(path, context) {
      if (path.shouldSkip) return;
      const value = getPropertyAssignmentValue(path);
      const updatedValue = value && transform(value);
      if (updatedValue) {
        const target = path.get('left');
        const key = target.get('property').node;
        const computed = target.node.computed;
        rewritePropertyAssignment(path, { key, computed }, updatedValue);
      } else {
        removePropertyAssignment(path);
      }
      path.skip();
    },
    value(path, context) {
      if (path.shouldSkip) return;
      const updatedValue = transform(path);
      if (updatedValue) {
        path.replaceWith(updatedValue);
      } else {
        path.replaceWith(t.identifier('undefined'));
      }
      path.skip();
    },
    jsxAttribute(path, context) {
      return;
    },
    vueAttribute(templateNode, component, context) {
      return;
    },
  };
  return transformer;
}

function migrateProperty<AstTransformContext>(
  targetKey: string | PropertyAccessor,
  transform: PropertyValueTransformer,
): PropertyTransformer<AstTransformContext> {
  const targetAccessor =
    typeof targetKey === 'string' ? { key: t.identifier(targetKey), computed: false } : targetKey;
  const transformer: PropertyTransformer<AstTransformContext> = {
    init(path, context) {
      if (path.shouldSkip) return;
      if (siblingPropertyInitializerExists(path, targetAccessor)) {
        path.remove();
        return;
      }
      const value = getPropertyInitializerValue(path);
      const updatedValue = value && transform(value);
      if (updatedValue) {
        rewritePropertyInitializer(path, targetAccessor, updatedValue);
      } else {
        path.remove();
      }
      path.skip();
    },
    get(path, context) {
      if (path.shouldSkip) return;
      if (path.isIdentifier()) {
      } else if (path.isObjectProperty()) {
        const { value, decorators } = path.node;
        const { key, computed } = targetAccessor;
        path.replaceWith(t.objectProperty(key, value, computed, false, decorators));
      } else if (path.isMemberExpression()) {
        const object = path.get('object');
        const { key, computed } = targetAccessor;
        path.replaceWith(t.memberExpression(object.node, key, computed, false));
      }
      path.skip();
    },
    set(path, context) {
      if (path.shouldSkip) return;
      if (siblingPropertyAssignmentExists(path, targetAccessor)) {
        removePropertyAssignment(path);
        return;
      }
      const value = getPropertyAssignmentValue(path);
      const updatedValue = value && transform(value);
      if (updatedValue) {
        rewritePropertyAssignment(path, targetAccessor, updatedValue);
      } else {
        removePropertyAssignment(path);
      }
      path.skip();
    },
    value(path, context) {
      if (path.shouldSkip) return;
      const updatedValue = transform(path);
      if (updatedValue) {
        path.replaceWith(updatedValue);
      } else {
        path.replaceWith(t.identifier('undefined'));
      }
      path.skip();
    },
    jsxAttribute(path, context) {
      if (path.shouldSkip) return;
      if (siblingJsxAttributeExists(path, targetAccessor)) {
        path.remove();
      }
      const updatedName = formatJsxAttributeAccessor(targetAccessor);
      if (updatedName) {
        path.get('name').replaceWith(updatedName);
      } else {
        path.remove();
      }
      path.skip();
    },
    vueAttribute(templateNode, component, context) {
      if (!isVueDirectiveAttribute(templateNode)) return;
      // Rewrite the element attribute name
      const attributeKey = getVueTemplateNodeChild(templateNode, 'key');
      const attributeKeyName = getVueTemplateNodeChild(attributeKey, 'argument');
      if (!attributeKeyName || attributeKeyName.node.type !== 'VIdentifier') return;
      // TODO: Support complex target attribute names when renaming Vue element attributes
      if (!targetAccessor.computed && targetAccessor.key.type === 'Identifier') {
        replaceVueTemplateNode(
          attributeKeyName,
          createVueAstNode({
            type: 'VIdentifier',
            name: targetAccessor.key.name,
            rawName: targetAccessor.key.name,
          }),
        );
      }
    },
  };
  return transformer;
}

function removeProperty(
  deprecationWarning: string,
): PropertyTransformer<AstTransformContext<AstCliContext>> {
  return {
    init(path, context) {
      if (path.shouldSkip) return;
      if (!context.opts.applyDangerousEdits) {
        context.opts.warn(path, deprecationWarning);
        path.skip();
        return;
      }
      path.remove();
      path.skip();
    },
    get(path, context) {
      if (path.shouldSkip) return;
      if (!context.opts.applyDangerousEdits) {
        context.opts.warn(path, deprecationWarning);
        path.skip();
        return;
      }
      path.replaceWith(t.identifier('undefined'));
      path.skip();
    },
    set(path, context) {
      if (path.shouldSkip) return;
      if (!context.opts.applyDangerousEdits) {
        context.opts.warn(path, deprecationWarning);
        path.skip();
        return;
      }
      removePropertyAssignment(path);
      path.skip();
    },
    value(path, context) {
      if (path.shouldSkip) return;
      const removed = getRemovedPropertyValueContainer(path);
      if (!context.opts.applyDangerousEdits) {
        context.opts.warn(removed, deprecationWarning);
        path.skip();
        return;
      }
      removed.remove();
      path.skip();
    },
    jsxAttribute(path, context) {
      if (path.shouldSkip) return;
      if (!context.opts.applyDangerousEdits) {
        context.opts.warn(path, deprecationWarning);
        path.skip();
        return;
      }
      path.remove();
      path.skip();
    },
    vueAttribute(templateNode, component, context) {
      if (!context.opts.applyDangerousEdits) {
        // FIXME: show Vue template element location in deprecation warnings
        context.opts.warn(null, deprecationWarning);
        return;
      }
      removeVueTemplateNode(templateNode);
    },
  };
}

function getRemovedPropertyValueContainer(path: NodePath<PropertyValueNode>): NodePath {
  if (path.parentPath.isJSXAttribute()) {
    return path.parentPath;
  } else if (
    path.parentPath.isJSXExpressionContainer() &&
    path.parentPath.parentPath.isJSXAttribute()
  ) {
    return path.parentPath.parentPath;
  } else if (
    path.parentPath.isObjectProperty() &&
    path.parentPath.parentPath.isObjectExpression()
  ) {
    return path.parentPath;
  } else if (
    path.parentPath.isAssignmentExpression() &&
    path.parentPath.get('right').node === path.node &&
    path.parentPath.parentPath.isExpressionStatement()
  ) {
    return path.parentPath.parentPath;
  } else {
    return path;
  }
}

function migrateOptionalValue(): PropertyValueTransformer {
  return transformOptionalValue((value) => value.node);
}

function transformOptionalValue(transform: PropertyValueTransformer): PropertyValueTransformer {
  return (value) => {
    if (value.isNullLiteral() || isUndefinedLiteral(value)) return null;
    return transform ? transform(value) : value.node;
  };
}

function invertOptionalBooleanValue(): PropertyValueTransformer {
  return transformOptionalValue((value) => {
    const { node } = value;
    if (t.isObjectMethod(node)) return t.booleanLiteral(false);
    if (t.isJSXAttribute(node))
      return t.booleanLiteral(isBooleanShorthandJsxAttribute(node) ? false : true);
    if (t.isJSXEmptyExpression(node)) return t.booleanLiteral(true);
    if (t.isBooleanLiteral(node)) return t.booleanLiteral(!node.value);
    return t.unaryExpression('!', node);
  });
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
      return parseGridOptionInitializerAccessor(existingProperty);
    })
    .filter(nonNull)
    .some((existingAccessor) => arePropertyAccessorsEqual(accessor, existingAccessor));
}

function siblingPropertyAssignmentExists(
  property: NodePath<PropertyAssignmentNode>,
  accessor: PropertyAccessor,
): boolean {
  if (property.isAssignmentExpression()) {
    // If the target of the assignment is a bound variable, find other assignments to the same object
    // FIXME: improve checking for dynamically assigned sibling properties
    const target = getDynamicPropertyAssignmentTarget(property);
    if (!target || !target.isIdentifier()) return false;
    const binding = target.scope.getBinding(target.node.name);
    if (!binding) return false;
    // For each reference to the target variable, check whether the reference is part of a property assignment that
    // assigns to the same key as the current assignment expression
    const assignmentExpression = property;
    return binding.referencePaths.some((path) => {
      if (!path.parentPath) return false;
      if (!path.parentPath.isMemberExpression()) return false;
      const refObject = path.parentPath.get('object');
      const refProperty = path.parentPath.get('property');
      if (refObject.node !== path.node || refObject.node === refProperty.node) return false;
      if (!isPropertyAssignmentNode(path.parentPath.parentPath)) return false;
      // Exclude the current assignment
      if (path.parentPath.parentPath.node === assignmentExpression.node) return false;
      const refAccessor = parseGridOptionAssignmentAccessor(path.parentPath.parentPath);
      if (!refAccessor) return false;
      return arePropertyAccessorsEqual(accessor, refAccessor);
    });
  }
  return false;
}

function siblingJsxAttributeExists(
  property: NodePath<JSXAttribute>,
  accessor: PropertyAccessor,
): boolean {
  if (!property.parentPath.isJSXOpeningElement()) return false;
  return property.parentPath
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

function formatJsxAttributeAccessor(attribute: PropertyAccessor): JSXAttribute['name'] | null {
  const { key, computed } = attribute;
  if (!computed && t.isIdentifier(key)) return t.jsxIdentifier(key.name);
  if (t.isMemberExpression(key) && t.isIdentifier(key.object) && t.isIdentifier(key.property)) {
    return t.jSXNamespacedName(
      t.jsxIdentifier(key.object.name),
      t.jsxIdentifier(key.property.name),
    );
  }
  return null;
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
): NodePath<PropertyValueNode> | null {
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

function getPropertyAssignmentValue(
  property: NodePath<PropertyAssignmentNode>,
): NodePath<PropertyValueNode> | null {
  if (property.isAssignmentExpression()) {
    const value = property.get('right');
    return value;
  }
  return null;
}

function rewritePropertyInitializer(
  property: NodePath<PropertyInitializerNode>,
  targetAccessor: PropertyAccessor,
  value: PropertyValueNode,
): void {
  const { key, computed } = targetAccessor;
  if (t.isObjectMethod(value)) {
    if (t.isPrivateName(key)) {
      property.replaceWith(
        t.objectProperty(key, formatPropertyValueNodeExpression(value), computed),
      );
    } else {
      const { kind, params, body, computed, generator, async } = value;
      property.replaceWith(t.objectMethod(kind, key, params, body, computed, generator, async));
    }
  } else {
    property.replaceWith(t.objectProperty(key, formatPropertyValueNodeExpression(value), computed));
  }
}

function rewritePropertyAssignment(
  property: NodePath<PropertyAssignmentNode>,
  targetAccessor: PropertyAccessor,
  value: PropertyValueNode,
): void {
  const target = property.get('left');
  if (target.isMemberExpression()) {
    const object = target.get('object');
    const { key, computed } = targetAccessor;
    property.replaceWith(
      t.assignmentExpression(
        property.node.operator,
        t.memberExpression(object.node, key, computed),
        formatPropertyValueNodeExpression(value),
      ),
    );
  } else {
    property.remove();
  }
}

function formatPropertyValueNodeExpression(value: PropertyValueNode): Expression {
  if (t.isObjectMethod(value)) {
    const { key, params, body, computed, generator, async } = value;
    const id = !computed && t.isIdentifier(key) ? key : null;
    return t.functionExpression(id, params, body, generator, async);
  }
  if (t.isJSXEmptyExpression(value)) return t.identifier('undefined');
  if (t.isJSXAttribute(value) && !value.value) return t.booleanLiteral(true);
  return value;
}

function formatJsxAttributeValue(value: PropertyValueNode): JSXAttribute['value'] {
  if (t.isObjectMethod(value)) {
    return t.jsxExpressionContainer(formatPropertyValueNodeExpression(value));
  }
  if (t.isJSXAttribute(value) && isBooleanShorthandJsxAttribute(value)) return null;
  return t.jsxExpressionContainer(value);
}

function removePropertyAssignment(property: NodePath<PropertyAssignmentNode>): void {
  if (property.isAssignmentExpression() && property.parentPath.isExpressionStatement()) {
    property.parentPath.remove();
  } else {
    property.remove();
  }
}

function isBooleanShorthandJsxAttribute(node: JSXAttribute): node is JsxBooleanShorthandAttribute {
  return !node.value;
}

function isUndefinedLiteral(path: NodePath<AstNode>): path is NodePath<Identifier> {
  return (
    path.isIdentifier() && path.node.name === 'undefined' && !path.scope.getBinding('undefined')
  );
}
