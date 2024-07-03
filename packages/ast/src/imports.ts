import {
  AstTransformContext,
  TransformContext,
  type Binding,
  type NodePath,
  type Types,
} from './types';
import { getOptionalNodeFieldValue, getStaticPropertyKey, node as t } from './node';
import {
  Enum,
  EnumVariant,
  StringMatcher,
  match,
  matchString,
  matchImport,
} from '@ag-grid-devtools/utils';

type CallExpression = Types.CallExpression;
type Expression = Types.Expression;
type Identifier = Types.Identifier;
type ImportDeclaration = Types.ImportDeclaration;
type ImportNamespaceSpecifier = Types.ImportNamespaceSpecifier;
type ImportSpecifier = Types.ImportSpecifier;
type JSXIdentifier = Types.JSXIdentifier;
type MemberExpression = Types.MemberExpression;
type ObjectPattern = Types.ObjectPattern;
type ObjectProperty = Types.ObjectProperty;
type StringLiteral = Types.StringLiteral;
type VariableDeclaration = Types.VariableDeclaration;
type VariableDeclarator = Types.VariableDeclarator;

type CommonJsRequireExpression = CallExpression & {
  callee: Identifier & { name: 'require' };
  arguments: [StringLiteral];
};

type PackageNamespaceImportBinding = Enum<{
  Module: {
    declaration: NodePath<ImportDeclaration>;
    specifier: NodePath<ImportNamespaceSpecifier>;
    local: NodePath<Identifier>;
  };
  CommonJs: {
    require: NodePath<CommonJsRequireExpression>;
    local: NodePath<Identifier> | null;
  };
  UmdGlobal: {
    local: NodePath<Identifier> | null;
  };
}>;

const PackageNamespaceImportBinding = Enum.create<PackageNamespaceImportBinding>({
  Module: true,
  CommonJs: true,
  UmdGlobal: true,
});

type NamedImportBinding = Enum<{
  Module: {
    declaration: NodePath<ImportDeclaration>;
    accessor: Enum<{
      Named: {
        specifier: NodePath<ImportSpecifier>;
      };
      Namespaced: {
        specifier: NodePath<ImportNamespaceSpecifier>;
        accessor: NodePath<MemberExpression>;
        local: NodePath<Identifier> | null;
      };
    }>;
  };
  CommonJs: {
    require: NodePath<CommonJsRequireExpression>;
    accessor: Enum<{
      Destructured: {
        declaration: NodePath<VariableDeclaration>;
        declarator: NodePath<VariableDeclarator>;
        accessors: NodePath<ObjectPattern>;
        local: NodePath<Identifier>;
      };
      Namespaced: {
        accessor: NodePath<MemberExpression>;
        local: NodePath<Identifier> | null;
      };
    }>;
  };
  UmdGlobal: {
    accessor: Enum<{
      Destructured: {
        declaration: NodePath<VariableDeclaration>;
        declarator: NodePath<VariableDeclarator>;
        accessors: NodePath<ObjectPattern>;
        local: NodePath<Identifier>;
      };
      Namespaced: {
        accessor: NodePath<MemberExpression>;
        local: NodePath<Identifier> | null;
      };
    }>;
  };
}>;

const NamedImportBinding = Enum.create<NamedImportBinding>({
  Module: true,
  CommonJs: true,
  UmdGlobal: true,
});

const NamedModuleImportBindingAccessor = Enum.create<
  EnumVariant<NamedImportBinding, 'Module'>['accessor']
>({
  Named: true,
  Namespaced: true,
});

const NamedCommonJsImportBindingAccessor = Enum.create<
  EnumVariant<NamedImportBinding, 'CommonJs'>['accessor']
>({
  Destructured: true,
  Namespaced: true,
});

const NamedUmdImportBindingAccessor = Enum.create<
  EnumVariant<NamedImportBinding, 'UmdGlobal'>['accessor']
>({
  Destructured: true,
  Namespaced: true,
});

function buildImportNamePattern(
  packageNamePattern: StringMatcher,
  context: AstTransformContext<TransformContext>,
): StringMatcher {
  const { allowedImports } = context.opts;
  return allowedImports ? [packageNamePattern, allowedImports] : packageNamePattern;
}

export function getNamedModuleImportExpression(
  expression: NodePath<Expression | JSXIdentifier>,
  packageName: StringMatcher,
  umdGlobalName: StringMatcher | null,
  importedName: StringMatcher,
  context: AstTransformContext<TransformContext>,
): NamedImportBinding | null {
  if (expression.isIdentifier()) {
    const binding = expression.scope.getBinding(expression.node.name);
    if (!binding) return null;
    return getNamedModuleImportBinding(binding, packageName, umdGlobalName, importedName, context);
  }
  if (expression.isJSXIdentifier()) {
    const binding = expression.scope.getBinding(expression.node.name);
    if (!binding) return null;
    return getNamedModuleImportBinding(binding, packageName, umdGlobalName, importedName, context);
  }
  if (expression.isMemberExpression()) {
    const object = expression.get('object');
    const property = expression.get('property');
    const computed = expression.node.computed;
    const propertyKey = getStaticPropertyKey(property.node, computed);
    if (!propertyKey || !matchString(propertyKey, importedName)) return null;
    const namespaceImport = getNamedPackageNamespaceImportExpression(
      object,
      packageName,
      umdGlobalName,
      context,
    );
    if (!namespaceImport) return null;
    return match(namespaceImport, {
      CommonJs: ({ require }) =>
        NamedImportBinding.CommonJs({
          require,
          accessor: NamedCommonJsImportBindingAccessor.Namespaced({
            accessor: expression,
            local: null,
          }),
        }),
      Module: ({ declaration, specifier }) =>
        NamedImportBinding.Module({
          declaration,
          accessor: NamedModuleImportBindingAccessor.Namespaced({
            specifier,
            accessor: expression,
            local: null,
          }),
        }),
      UmdGlobal: ({}) =>
        NamedImportBinding.UmdGlobal({
          accessor: NamedUmdImportBindingAccessor.Namespaced({
            accessor: expression,
            local: null,
          }),
        }),
    });
  }
  return null;
}

function getNamedModuleImportBinding(
  binding: Binding,
  packageName: StringMatcher,
  umdGlobalName: StringMatcher | null,
  importedName: StringMatcher,
  context: AstTransformContext<TransformContext>,
): NamedImportBinding | null {
  switch (binding.kind) {
    case 'module':
      return getNamedEsModuleImportBinding(binding, packageName, importedName, context);
    case 'var':
    case 'let':
    case 'const':
      return getNamedUmdImportBinding(binding, packageName, umdGlobalName, importedName, context);
    case 'hoisted':
    case 'param':
    case 'local':
    case 'unknown':
    default:
      return null;
  }
}

function getNamedEsModuleImportBinding(
  binding: Binding,
  packageName: StringMatcher,
  importedName: StringMatcher,
  context: AstTransformContext<TransformContext>,
): NamedImportBinding | null {
  const target = binding.path;
  if (!target.isImportSpecifier() || !target.parentPath.isImportDeclaration()) {
    return null;
  }
  const {
    parentPath: { node: importDeclaration },
    node: importSpecifier,
  } = target;
  if (
    !matchModuleImportName(importDeclaration, importSpecifier, packageName, importedName, context)
  )
    return null;
  return NamedImportBinding.Module({
    declaration: target.parentPath,
    accessor: NamedModuleImportBindingAccessor.Named({
      specifier: target,
    }),
  });
}

function getNamedUmdImportBinding(
  binding: Binding,
  packageName: StringMatcher,
  umdGlobalName: StringMatcher | null,
  importedName: StringMatcher,
  context: AstTransformContext<TransformContext>,
): NamedImportBinding | null {
  const target = binding.path;
  if (!target.isVariableDeclarator() || !target.parentPath.isVariableDeclaration()) return null;
  const initializer = getOptionalNodeFieldValue(target.get('init'));
  if (!initializer) return null;
  if (initializer.isMemberExpression()) {
    const object = initializer.get('object');
    const key = initializer.get('property');
    const computed = initializer.node.computed;
    const actualImportedName = getStaticPropertyKey(key.node, computed);
    if (!actualImportedName || !matchString(actualImportedName, importedName)) return null;
    const exportAccessor = target.get('id');
    if (!exportAccessor.isIdentifier()) return null;
    if (isNamedCommonJsRequireExpression(object, packageName, context)) {
      return NamedImportBinding.CommonJs({
        require: object,
        accessor: NamedCommonJsImportBindingAccessor.Namespaced({
          accessor: initializer,
          local: exportAccessor,
        }),
      });
    }
    if (
      umdGlobalName != null &&
      isNamedUmdGlobalNamespaceExpression(object, umdGlobalName, context)
    ) {
      return NamedImportBinding.UmdGlobal({
        accessor: NamedCommonJsImportBindingAccessor.Namespaced({
          accessor: initializer,
          local: exportAccessor,
        }),
      });
    }
    return null;
  }
  if (isNamedCommonJsRequireExpression(initializer, packageName, context)) {
    const exportAccessors = target.get('id');
    if (!exportAccessors.isObjectPattern()) return null;
    const exportAccessor = exportAccessors
      .get('properties')
      .filter((property): property is NodePath<ObjectProperty> => property.isObjectProperty())
      .find((property) => {
        const local = property.get('value');
        return local.isIdentifier() && local.node.name === binding.identifier.name;
      });
    if (!exportAccessor) return null;
    const local = exportAccessor.get('value');
    if (!local.isIdentifier()) return null;
    const importedKey = exportAccessor.get('key');
    const computed = exportAccessor.node.computed;
    const actualImportedName = getStaticPropertyKey(importedKey.node, computed);
    if (!actualImportedName || !matchString(actualImportedName, importedName)) return null;
    return NamedImportBinding.CommonJs({
      require: initializer,
      accessor: NamedCommonJsImportBindingAccessor.Destructured({
        declaration: target.parentPath,
        declarator: target,
        accessors: exportAccessors,
        local: local,
      }),
    });
  }
  if (umdGlobalName && isNamedUmdGlobalNamespaceExpression(initializer, umdGlobalName, context)) {
    const exportAccessors = target.get('id');
    if (!exportAccessors.isObjectPattern()) return null;
    const exportAccessor = exportAccessors
      .get('properties')
      .filter((property): property is NodePath<ObjectProperty> => property.isObjectProperty())
      .find((property) => {
        const local = property.get('value');
        return local.isIdentifier() && local.node.name === binding.identifier.name;
      });
    if (!exportAccessor) return null;
    const local = exportAccessor.get('value');
    if (!local.isIdentifier()) return null;
    const importedKey = exportAccessor.get('key');
    const computed = exportAccessor.node.computed;
    const actualImportedName = getStaticPropertyKey(importedKey.node, computed);
    if (!actualImportedName || !matchString(actualImportedName, importedName)) return null;
    return NamedImportBinding.UmdGlobal({
      accessor: NamedCommonJsImportBindingAccessor.Destructured({
        declaration: target.parentPath,
        declarator: target,
        accessors: exportAccessors,
        local: local,
      }),
    });
  }
  return null;
}

export function getNamedPackageNamespaceImportExpression(
  expression: NodePath<Expression>,
  packageName: StringMatcher,
  umdGlobalName: StringMatcher | null,
  context: AstTransformContext<TransformContext>,
): PackageNamespaceImportBinding | null {
  if (isCommonJsRequireExpression(expression)) {
    if (
      !matchImport(expression.node.arguments[0].value, buildImportNamePattern(packageName, context))
    )
      return null;
    return PackageNamespaceImportBinding.CommonJs({
      require: expression,
      local: null,
    });
  }
  if (
    umdGlobalName != null &&
    isNamedUmdGlobalNamespaceExpression(expression, umdGlobalName, context)
  ) {
    return PackageNamespaceImportBinding.UmdGlobal({
      local: expression,
    });
  }
  if (expression.isIdentifier()) {
    const binding = expression.scope.getBinding(expression.node.name);
    if (!binding) return null;
    const packageNamespaceImport = getNamedPackageNamespaceImportBinding(
      binding,
      packageName,
      umdGlobalName,
      context,
    );
    if (!packageNamespaceImport) return null;
    return match(packageNamespaceImport, {
      CommonJs: ({ require }) =>
        PackageNamespaceImportBinding.CommonJs({
          require,
          local: expression,
        }),
      Module: ({ declaration, specifier }) =>
        PackageNamespaceImportBinding.Module({
          declaration,
          specifier,
          local: expression,
        }),
      UmdGlobal: ({}) => PackageNamespaceImportBinding.UmdGlobal({ local: expression }),
    });
  }
  return null;
}

function isNamedUmdGlobalNamespaceExpression(
  expression: NodePath<Expression>,
  umdGlobalName: StringMatcher,
  context: AstTransformContext<TransformContext>,
): expression is NodePath<Identifier> {
  if (!expression.isIdentifier()) return false;
  return matchImport(expression.node.name, buildImportNamePattern(umdGlobalName, context));
}

function getNamedPackageNamespaceImportBinding(
  binding: Binding,
  packageName: StringMatcher,
  umdGlobalName: StringMatcher | null,
  context: AstTransformContext<TransformContext>,
): PackageNamespaceImportBinding | null {
  switch (binding.kind) {
    case 'module':
      return getNamedEsModulePackageNamespaceImportBinding(binding, packageName, context);
    case 'var':
    case 'let':
    case 'const':
      return getNamedUmdPackageNamespaceImportBinding(binding, packageName, umdGlobalName, context);
    case 'hoisted':
    case 'param':
    case 'local':
    case 'unknown':
    default:
      return null;
  }
}

function getNamedEsModulePackageNamespaceImportBinding(
  binding: Binding,
  packageName: StringMatcher,
  context: AstTransformContext<TransformContext>,
): PackageNamespaceImportBinding | null {
  const target = binding.path;
  if (!target.isImportNamespaceSpecifier() || !target.parentPath.isImportDeclaration()) {
    return null;
  }
  const {
    parentPath: { node: importDeclaration },
  } = target;
  if (!matchModuleImportPackageName(importDeclaration, packageName, context)) return null;
  return PackageNamespaceImportBinding.Module({
    declaration: target.parentPath,
    specifier: target,
    local: target.get('local'),
  });
}

function getNamedUmdPackageNamespaceImportBinding(
  binding: Binding,
  packageName: StringMatcher,
  umdGlobalName: StringMatcher | null,
  context: AstTransformContext<TransformContext>,
): PackageNamespaceImportBinding | null {
  const target = binding.path;
  if (!target.isVariableDeclarator() || !target.parentPath.isVariableDeclaration()) return null;
  const initializer = getOptionalNodeFieldValue(target.get('init'));
  if (!initializer) return null;
  if (isNamedCommonJsRequireExpression(initializer, packageName, context)) {
    return PackageNamespaceImportBinding.CommonJs({
      require: initializer,
      local: null,
    });
  }
  if (
    umdGlobalName != null &&
    isNamedUmdGlobalNamespaceExpression(initializer, umdGlobalName, context)
  ) {
    return PackageNamespaceImportBinding.UmdGlobal({
      local: null,
    });
  }
  return null;
}

export function matchModuleImportName(
  declaration: ImportDeclaration,
  specifier: ImportSpecifier,
  packageName: StringMatcher,
  importedName: StringMatcher,
  context: AstTransformContext<TransformContext>,
): {
  packageName: string;
  importedName: string;
} | null {
  const actualPackageName = matchModuleImportPackageName(declaration, packageName, context);
  if (!actualPackageName) return null;
  const actualImportedName = getImportSpecifierImportedName(specifier);
  if (!matchString(actualImportedName, importedName)) return null;
  return { packageName: actualPackageName, importedName: actualImportedName };
}

export function matchModuleImportPackageName(
  declaration: ImportDeclaration,
  packageName: StringMatcher,
  context: AstTransformContext<TransformContext>,
): string | null {
  const actualPackageName = declaration.source.value;
  if (!matchImport(actualPackageName, buildImportNamePattern(packageName, context))) return null;
  return actualPackageName;
}

export function findNamedModuleImport(
  declaration: ImportDeclaration,
  pattern: StringMatcher,
  context: AstTransformContext<TransformContext>,
): ImportSpecifier | null {
  return (
    declaration.specifiers
      .filter((node): node is ImportSpecifier => t.isImportSpecifier(node))
      .find((specifier) => {
        const importedItem = getImportSpecifierImportedName(specifier);
        if (!matchImport(importedItem, buildImportNamePattern(pattern, context))) return null;
        return true;
      }) || null
  );
}

export function insertNamedModuleImport(
  declaration: NodePath<ImportDeclaration>,
  specifier: ImportSpecifier,
): Identifier {
  declaration.pushContainer('specifiers', specifier);
  return specifier.local;
}

export function getImportSpecifierImportedName(specifier: ImportSpecifier): string {
  return t.isStringLiteral(specifier.imported) ? specifier.imported.value : specifier.imported.name;
}

function isNamedCommonJsRequireExpression(
  expression: NodePath<Expression>,
  packageName: StringMatcher,
  context: AstTransformContext<TransformContext>,
): expression is NodePath<CommonJsRequireExpression> {
  if (!isCommonJsRequireExpression(expression)) return false;
  const requirePath = expression.node.arguments[0].value;
  return matchImport(requirePath, buildImportNamePattern(packageName, context));
}

function isCommonJsRequireExpression(
  expression: NodePath<Expression>,
): expression is NodePath<CommonJsRequireExpression> {
  return (
    isCommonJsRequireExpressionNode(expression.node) && !expression.scope.hasBinding('require')
  );
}

function isCommonJsRequireExpressionNode(node: Expression): node is CommonJsRequireExpression {
  return (
    t.isCallExpression(node) &&
    t.isIdentifier(node.callee) &&
    node.callee.name === 'require' &&
    node.arguments.length === 1 &&
    t.isStringLiteral(node.arguments[0])
  );
}
