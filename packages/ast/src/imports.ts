import {
  AstTransformContext,
  ImportMatcherResult,
  TransformContext,
  type Binding,
  type NodePath,
  type Types,
} from './types';
import { getOptionalNodeFieldValue, getStaticPropertyKey, node as t } from './node';
import { Enum, EnumVariant, match } from '@ag-grid-devtools/utils';
import {
  Framework,
  MatchGridImportNameArgs,
  ImportType,
  KnownExportName,
  AgGridExportName,
  isAgGridExportName,
} from '@ag-grid-devtools/types';

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

export interface ImportedModuleMatcher {
  /** The basic pattern or module name to match */
  importModulePattern: RegExp | string;

  /** The umd pattern or module name to match */
  importUmdPattern: RegExp | string | null;

  /** The framework type, passed as is to the user config isGridModule method. */
  framework: Framework;

  /** If true, the UserConfig callbacks will not be called. Default is false. */
  skipUserConfig?: boolean;
}

function matchImportedSpecifier(
  moduleType: ImportType,
  importPath: string,
  importedModuleMatcher: ImportedModuleMatcher,
  importName: string,
  agGridExportName: KnownExportName,
  context: AstTransformContext<TransformContext>,
): ImportMatcherResult | null {
  const {
    importModulePattern: pattern,
    importUmdPattern: umdPattern,
    framework,
    skipUserConfig,
  } = importedModuleMatcher;
  let patternToCheck = pattern;
  if (moduleType === 'umd' && umdPattern) {
    patternToCheck = umdPattern;
  }

  if (
    typeof patternToCheck === 'string'
      ? importPath === patternToCheck
      : patternToCheck.test(importPath)
  ) {
    if (importName == agGridExportName) {
      return { fromUserConfig: null };
    }
    return null;
  }

  if (skipUserConfig) {
    return null;
  }

  if (!isAgGridExportName(agGridExportName)) {
    return null; // This specifier is not an ag-grid export, no user config needed.
  }

  const userConfig = context.opts.userConfig;
  if (!userConfig) {
    return null;
  }

  const filename = context.filename;

  if (userConfig.matchGridImport) {
    // Store in the cache so we don't ask the same question to the UserConfig isGridModule
    const cacheKey = importPath + '\n' + framework + '\n' + moduleType + '\n' + filename;
    let userConfigIsGridModuleCache = context._userConfigIsGridModuleCache;
    if (!userConfigIsGridModuleCache) {
      userConfigIsGridModuleCache = new Map();
      context._userConfigIsGridModuleCache = userConfigIsGridModuleCache;
    }

    let moduleArgs = userConfigIsGridModuleCache.get(cacheKey);
    if (moduleArgs === null) {
      return null; // UserConfig has already said this is not a grid module.
    }
    if (moduleArgs === undefined) {
      moduleArgs = {
        importPath: importPath,
        framework,
        importType: moduleType,
        sourceFilePath: filename,
      };

      if (!userConfig.matchGridImport(moduleArgs)) {
        userConfigIsGridModuleCache.set(cacheKey, null);
        return null; // UserConfig has said this is not a grid module.
      }
      userConfigIsGridModuleCache.set(cacheKey, moduleArgs);
    }

    if (userConfig.matchGridImportName) {
      // Store in the cache so we don't ask the same question to the UserConfig isGridModuleExport
      const specifierCacheKey = cacheKey + '\n' + match + '\n' + importName;

      let userConfigIsGridModuleExportCache = context._userConfigIsGridModuleExportCache;

      let result: ImportMatcherResult | null | undefined;

      if (!userConfigIsGridModuleExportCache) {
        userConfigIsGridModuleExportCache = new Map();
        context._userConfigIsGridModuleExportCache = userConfigIsGridModuleExportCache;
      } else {
        result = userConfigIsGridModuleExportCache.get(specifierCacheKey);
      }

      if (result !== undefined) {
        return result; // UserConfig has already answered this question.
      }

      const fromUserConfig: MatchGridImportNameArgs = {
        ...moduleArgs,
        agGridExportName,
        importName,
      };

      if (userConfig.matchGridImportName(fromUserConfig)) {
        result = { fromUserConfig };
      }

      if (
        !result &&
        framework === 'vanilla' &&
        agGridExportName === AgGridExportName.createGrid &&
        userConfig.getCreateGridName
      ) {
        result = { fromUserConfig }; // Special case for createGrid
      }

      if (!result) {
        result = null;
      }

      userConfigIsGridModuleExportCache.set(specifierCacheKey, result);
      return result;
    }

    if (importName === agGridExportName) {
      return { fromUserConfig: null };
    }

    if (
      framework === 'vanilla' &&
      agGridExportName === AgGridExportName.createGrid &&
      userConfig.getCreateGridName
    ) {
      return {
        fromUserConfig: {
          ...moduleArgs,
          agGridExportName,
          importName,
        },
      }; // Special case for the config createGridName
    }
  }

  if (importName === agGridExportName) {
    return { fromUserConfig: null };
  }

  return null;
}

export interface PackageNamespaceImport {
  binding: NamedImportBinding;
  importMatcherResult: ImportMatcherResult;
}

export function getNamedModuleImportExpression(
  expression: NodePath<Expression | JSXIdentifier>,
  importedModuleMatcher: ImportedModuleMatcher,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): PackageNamespaceImport | null {
  if (expression.isIdentifier()) {
    const binding = expression.scope.getBinding(expression.node.name);
    if (!binding) return null;
    return getNamedModuleImportBinding(
      binding,
      importedModuleMatcher,
      importedModuleSpecifierMatcher,
      context,
    );
  }
  if (expression.isJSXIdentifier()) {
    const binding = expression.scope.getBinding(expression.node.name);
    if (!binding) return null;
    return getNamedModuleImportBinding(
      binding,
      importedModuleMatcher,
      importedModuleSpecifierMatcher,
      context,
    );
  }
  if (expression.isMemberExpression()) {
    const object = expression.get('object');
    const property = expression.get('property');
    const computed = expression.node.computed;
    const propertyKey = getStaticPropertyKey(property.node, computed);
    if (!propertyKey) return null;
    const namespaceImport = getNamedPackageNamespaceImportExpression(
      object,
      importedModuleMatcher,
      propertyKey,
      importedModuleSpecifierMatcher,
      context,
    );
    if (!namespaceImport) return null;
    return {
      importMatcherResult: namespaceImport.importMatcherResult,
      binding: match(namespaceImport.binding, {
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
      }),
    };
  }
  return null;
}

function getNamedModuleImportBinding(
  binding: Binding,
  importedModuleMatcher: ImportedModuleMatcher,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): PackageNamespaceImport | null {
  switch (binding.kind) {
    case 'module':
      return getNamedEsModuleImportBinding(
        binding,
        importedModuleMatcher,
        importedModuleSpecifierMatcher,
        context,
      );
    case 'var':
    case 'let':
    case 'const':
      return getNamedUmdImportBinding(
        binding,
        importedModuleMatcher,
        importedModuleSpecifierMatcher,
        context,
      );
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
  importedModuleMatcher: ImportedModuleMatcher,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): PackageNamespaceImport | null {
  const target = binding.path;
  if (!target.isImportSpecifier() || !target.parentPath.isImportDeclaration()) {
    return null;
  }
  const {
    parentPath: { node: importDeclaration },
    node: importSpecifier,
  } = target;

  const matchedResult = matchModuleImportName(
    importDeclaration,
    importSpecifier,
    importedModuleMatcher,
    importedModuleSpecifierMatcher,
    context,
  );

  if (!matchedResult) {
    return null;
  }
  return {
    binding: NamedImportBinding.Module({
      declaration: target.parentPath,
      accessor: NamedModuleImportBindingAccessor.Named({
        specifier: target,
      }),
    }),
    importMatcherResult: matchedResult.importMatcherResult,
  };
}

function getNamedUmdImportBinding(
  binding: Binding,
  importedModuleMatcher: ImportedModuleMatcher,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): PackageNamespaceImport | null {
  const target = binding.path;
  if (!target.isVariableDeclarator() || !target.parentPath.isVariableDeclaration()) return null;
  const initializer = getOptionalNodeFieldValue(target.get('init'));
  if (!initializer) return null;
  if (initializer.isMemberExpression()) {
    const object = initializer.get('object');
    const key = initializer.get('property');
    const computed = initializer.node.computed;
    const importedModuleSpecifier = getStaticPropertyKey(key.node, computed);
    if (!importedModuleSpecifier) return null;
    const exportAccessor = target.get('id');
    if (!exportAccessor.isIdentifier()) return null;

    if (isCommonJsRequireExpression(object)) {
      const importMatcherResult = getNamedCommonJsRequireExpression(
        object,
        importedModuleMatcher,
        importedModuleSpecifier,
        importedModuleSpecifierMatcher,
        context,
      );
      if (importMatcherResult) {
        return {
          binding: NamedImportBinding.CommonJs({
            require: object,
            accessor: NamedCommonJsImportBindingAccessor.Namespaced({
              accessor: initializer,
              local: exportAccessor,
            }),
          }),
          importMatcherResult,
        };
      }
    }

    if (object.isIdentifier()) {
      const importMatcherResult = getNamedUmdGlobalNamespaceExpression(
        object,
        importedModuleMatcher,
        importedModuleSpecifier,
        importedModuleSpecifierMatcher,
        context,
      );
      if (importMatcherResult) {
        return {
          binding: NamedImportBinding.UmdGlobal({
            accessor: NamedCommonJsImportBindingAccessor.Namespaced({
              accessor: initializer,
              local: exportAccessor,
            }),
          }),
          importMatcherResult,
        };
      }
    }
  }
  if (isCommonJsRequireExpression(initializer)) {
    const exportAccessors = target.get('id');
    const exportAccessor =
      exportAccessors.isObjectPattern() &&
      exportAccessors
        .get('properties')
        .filter((property): property is NodePath<ObjectProperty> => property.isObjectProperty())
        .find((property) => {
          const local = property.get('value');
          return local.isIdentifier() && local.node.name === binding.identifier.name;
        });
    const local = exportAccessor && exportAccessor.get('value');
    if (local && local.isIdentifier()) {
      const importedKey = exportAccessor.get('key');
      const computed = exportAccessor.node.computed;
      const actualImportedName = getStaticPropertyKey(importedKey.node, computed);
      if (actualImportedName) {
        const importMatcherResult = getNamedCommonJsRequireExpression(
          initializer,
          importedModuleMatcher,
          actualImportedName,
          importedModuleSpecifierMatcher,
          context,
        );
        if (importMatcherResult) {
          return {
            binding: NamedImportBinding.CommonJs({
              require: initializer,
              accessor: NamedCommonJsImportBindingAccessor.Destructured({
                declaration: target.parentPath,
                declarator: target,
                accessors: exportAccessors,
                local: local,
              }),
            }),
            importMatcherResult,
          };
        }
      }
    }
  }

  if (initializer.isIdentifier()) {
    const exportAccessors = target.get('id');
    if (exportAccessors.isObjectPattern()) {
      const exportAccessor = exportAccessors
        .get('properties')
        .filter((property): property is NodePath<ObjectProperty> => property.isObjectProperty())
        .find((property) => {
          const local = property.get('value');
          return local.isIdentifier() && local.node.name === binding.identifier.name;
        });

      const local = exportAccessor && exportAccessor.get('value');
      if (local && local.isIdentifier()) {
        const importedKey = exportAccessor.get('key');
        const computed = exportAccessor.node.computed;
        const actualImportedName = getStaticPropertyKey(importedKey.node, computed);
        const importMatcherResult =
          actualImportedName &&
          getNamedUmdGlobalNamespaceExpression(
            initializer,
            importedModuleMatcher,
            actualImportedName,
            importedModuleSpecifierMatcher,
            context,
          );

        if (importMatcherResult) {
          return {
            binding: NamedImportBinding.UmdGlobal({
              accessor: NamedCommonJsImportBindingAccessor.Destructured({
                declaration: target.parentPath,
                declarator: target,
                accessors: exportAccessors,
                local: local,
              }),
            }),
            importMatcherResult,
          };
        }
      }
    }
  }

  return null;
}

function getNamedUmdImportBindingCommonJsSpecifier(
  binding: Binding,
  target: NodePath<Types.VariableDeclarator>,
) {
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
  return getStaticPropertyKey(importedKey.node, computed);
}

export interface NamedPackageNamespaceImport {
  binding: PackageNamespaceImportBinding;
  importMatcherResult: ImportMatcherResult;
}

export function getNamedPackageNamespaceImportExpression(
  expression: NodePath<Expression>,
  importedModuleMatcher: ImportedModuleMatcher,
  importedModuleSpecifier: string,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): NamedPackageNamespaceImport | null {
  if (isCommonJsRequireExpression(expression)) {
    const importMatcherResult = matchImportedSpecifier(
      'cjs',
      expression.node.arguments[0].value,
      importedModuleMatcher,
      importedModuleSpecifier,
      importedModuleSpecifierMatcher,
      context,
    );
    if (importMatcherResult) {
      return {
        importMatcherResult: importMatcherResult,
        binding: PackageNamespaceImportBinding.CommonJs({
          require: expression,
          local: null,
        }),
      };
    }
  }

  if (expression.isIdentifier()) {
    const importMatcherResult = getNamedUmdGlobalNamespaceExpression(
      expression,
      importedModuleMatcher,
      importedModuleSpecifier,
      importedModuleSpecifierMatcher,
      context,
    );
    if (importMatcherResult) {
      return {
        binding: PackageNamespaceImportBinding.UmdGlobal({ local: expression }),
        importMatcherResult,
      };
    }

    const binding = expression.scope.getBinding(expression.node.name);
    if (!binding) return null;
    const packageNamespaceImport = getNamedPackageNamespaceImportBinding(
      binding,
      importedModuleMatcher,
      importedModuleSpecifier,
      importedModuleSpecifierMatcher,
      context,
    );
    if (!packageNamespaceImport) return null;
    return {
      binding: match(packageNamespaceImport.binding, {
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
      }),
      importMatcherResult: packageNamespaceImport.importMatcherResult,
    };
  }
  return null;
}

function getNamedUmdGlobalNamespaceExpression(
  expression: NodePath<Identifier>,
  importedModuleMatcher: ImportedModuleMatcher,
  importName: string,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): ImportMatcherResult | null {
  return matchImportedSpecifier(
    'umd',
    expression.node.name,
    importedModuleMatcher,
    importName,
    importedModuleSpecifierMatcher,
    context,
  );
}

function getNamedPackageNamespaceImportBinding(
  binding: Binding,
  importedModuleMatcher: ImportedModuleMatcher,
  importedModuleSpecifier: string,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): NamedPackageNamespaceImport | null {
  switch (binding.kind) {
    case 'module':
      return getNamedEsModulePackageNamespaceImportBinding(
        binding,
        importedModuleMatcher,
        importedModuleSpecifier,
        importedModuleSpecifierMatcher,
        context,
      );
    case 'var':
    case 'let':
    case 'const':
      return getNamedUmdPackageNamespaceImportBinding(
        binding,
        importedModuleMatcher,
        importedModuleSpecifier,
        importedModuleSpecifierMatcher,
        context,
      );
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
  importedModuleMatcher: ImportedModuleMatcher,
  importedModuleSpecifier: string,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): NamedPackageNamespaceImport | null {
  const target = binding.path;
  if (!target.isImportNamespaceSpecifier() || !target.parentPath.isImportDeclaration()) {
    return null;
  }
  const {
    parentPath: { node: importDeclaration },
  } = target;
  const matchResult = matchModuleImportPackageName(
    importDeclaration,
    importedModuleMatcher,
    importedModuleSpecifier,
    importedModuleSpecifierMatcher,
    context,
  );
  if (!matchResult) {
    return null;
  }
  return {
    binding: PackageNamespaceImportBinding.Module({
      declaration: target.parentPath,
      specifier: target,
      local: target.get('local'),
    }),
    importMatcherResult: matchResult.importMatcherResult,
  };
}

function getNamedUmdPackageNamespaceImportBinding(
  binding: Binding,
  importedModuleMatcher: ImportedModuleMatcher,
  importedModuleSpecifier: string,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): NamedPackageNamespaceImport | null {
  const target = binding.path;
  if (!target.isVariableDeclarator() || !target.parentPath.isVariableDeclaration()) return null;
  const initializer = getOptionalNodeFieldValue(target.get('init'));
  if (!initializer) return null;
  if (isCommonJsRequireExpression(initializer)) {
    const importMatcherResult = getNamedCommonJsRequireExpression(
      initializer,
      importedModuleMatcher,
      importedModuleSpecifier,
      importedModuleSpecifierMatcher,
      context,
    );
    if (importMatcherResult) {
      return {
        binding: PackageNamespaceImportBinding.CommonJs({ require: initializer, local: null }),
        importMatcherResult,
      };
    }
  }
  if (initializer.isIdentifier()) {
    const importMatcherResult = getNamedUmdGlobalNamespaceExpression(
      initializer,
      importedModuleMatcher,
      importedModuleSpecifier,
      importedModuleSpecifierMatcher,
      context,
    );
    if (importMatcherResult) {
      return {
        binding: PackageNamespaceImportBinding.UmdGlobal({ local: null }),
        importMatcherResult,
      };
    }
  }
  return null;
}

export function matchModuleImportName(
  declaration: ImportDeclaration,
  specifier: ImportSpecifier,
  importedModuleMatcher: ImportedModuleMatcher,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): {
  packageName: string;
  importName: string;
  importMatcherResult: ImportMatcherResult;
} | null {
  const actualImportedName = getImportSpecifierImportedName(specifier);
  const matchedModuleImportPackage = matchModuleImportPackageName(
    declaration,
    importedModuleMatcher,
    actualImportedName,
    importedModuleSpecifierMatcher,
    context,
  );
  if (!matchedModuleImportPackage) return null;
  const { actualPackageName, importMatcherResult } = matchedModuleImportPackage;
  return {
    packageName: actualPackageName,
    importName: actualImportedName,
    importMatcherResult,
  };
}

export function matchModuleImportPackageName(
  declaration: ImportDeclaration,
  importedModuleMatcher: ImportedModuleMatcher,
  importedModuleSpecifier: string,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): { actualPackageName: string; importMatcherResult: ImportMatcherResult } | null {
  const actualPackageName = declaration.source.value;
  if (!actualPackageName) return null;
  const importMatcherResult = matchImportedSpecifier(
    'esm',
    actualPackageName,
    importedModuleMatcher,
    importedModuleSpecifier,
    importedModuleSpecifierMatcher,
    context,
  );
  if (!importMatcherResult) return null;
  return { actualPackageName, importMatcherResult };
}

export function findNamedModuleImport(
  declaration: ImportDeclaration,
  importedModuleSpecifierMatcher: string,
  context: AstTransformContext<TransformContext>,
): ImportSpecifier | null {
  return (
    declaration.specifiers
      .filter((node): node is ImportSpecifier => t.isImportSpecifier(node))
      .find(
        (specifier) => getImportSpecifierImportedName(specifier) === importedModuleSpecifierMatcher,
      ) || null
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

function getNamedCommonJsRequireExpression(
  expression: NodePath<CommonJsRequireExpression>,
  importedModuleMatcher: ImportedModuleMatcher,
  importedModuleSpecifier: string,
  importedModuleSpecifierMatcher: KnownExportName,
  context: AstTransformContext<TransformContext>,
): ImportMatcherResult | null {
  const requirePath = expression.node.arguments[0].value;
  return matchImportedSpecifier(
    'cjs',
    requirePath,
    importedModuleMatcher,
    importedModuleSpecifier,
    importedModuleSpecifierMatcher,
    context,
  );
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
