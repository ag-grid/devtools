import { format as applyPrettierFormat, resolveConfig as loadPrettierConfig } from 'prettier';
import { readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import template from '@babel/template';
import { parse as parseAst } from '@babel/parser';
import { transformFromAstSync } from '@babel/core';
import { parse, print } from 'recast';

const TEMPLATE_OPTIONS = {
  plugins: ['jsx', 'typescript', 'decorators-legacy'],
};

const JS_PARSER_PLUGINS = ['typescript', 'decorators-legacy'];
const JSX_PARSER_PLUGINS = ['jsx', ...JS_PARSER_PLUGINS];

const ast = {
  statement(literals, ...interpolations) {
    return template.statement(TEMPLATE_OPTIONS).ast(literals, ...interpolations);
  },
};

function transformAst(node, plugins, context, metadata) {
  const { filename } = context;
  const source = metadata && metadata.source;
  const result = transformFromAstSync(node, source || undefined, {
    code: false,
    ast: true,
    cloneInputAst: false, // See https://github.com/benjamn/recast#using-a-different-parser
    filename,
    plugins,
  });
  if (!result) return null;
  return result.ast || null;
}

export function isValidReleaseVersion(value) {
  return parseReleaseVersion(value) !== null;
}

export function retrieveExistingVersions(versionsDir) {
  return readdirSync(versionsDir).filter(isValidReleaseVersion);
}

export function getLatestReleaseVersion(versions) {
  return versions
    .map(parseReleaseVersion)
    .reduce(
      (latestVersion, versionNumber) =>
        latestVersion ? getMaxReleaseVersion(latestVersion, versionNumber) : versionNumber,
      null,
    )
    ?.join('.');
}

export function getNextReleaseVersion(versions, type = 'patch') {
  const latestVersion = getLatestReleaseVersion(versions);
  const [major, minor, patch] = latestVersion ? parseReleaseVersion(latestVersion) : [0, 0, 0];
  switch (type) {
    case 'major':
      return [major + 1, 0, 0].join('.');
    case 'minor':
      return [major, minor + 1, 0].join('.');
    case 'patch':
      return [major, minor, patch + 1].join('.');
    default:
      throw new Error(`Invalid release version type: ${type}`);
  }
}

export function parseReleaseVersion(versions) {
  const match = /^(\d+)\.(\d+)\.(\d)+$/.exec(versions);
  if (!match) return null;
  const [, major, minor, patch] = match;
  return [major, minor, patch].map(Number);
}

function getMaxReleaseVersion(left, right) {
  const result = left.reduce((result, leftValue, index) => {
    if (result) return result;
    const rightValue = right[index];
    if (rightValue === leftValue) return null;
    if (rightValue > leftValue) return right;
    return left;
  }, null);
  return result || right;
}

export async function addTransformToVersion({ versionPath, transformPath, transformIdentifier }) {
  const transformsPath = join(versionPath, 'transforms.ts');
  const versionManifestPath = join(versionPath, 'manifest.ts');
  const transformManifestPath = join(transformPath, 'manifest.ts');
  return Promise.all([
    transformFile(transformsPath, {
      plugins: [
        addModuleImports(
          ast.statement`
            import ${transformIdentifier} from '${getModuleImportPath(transformPath, {
              currentPath: transformsPath,
            })}';
          `,
        ),
        addTransformToCodemod(transformIdentifier),
      ],
      prettier: true,
    }),
    transformFile(versionManifestPath, {
      plugins: [
        addModuleImports(
          ast.statement`
            import ${transformIdentifier} from '${getModuleImportPath(transformManifestPath, {
              currentPath: transformsPath,
            })}';
          `,
        ),
        addTransformManifestToCodemodManifest(transformIdentifier),
      ],
      prettier: true,
    }),
  ]);

  function addTransformToCodemod(transformIdentifier) {
    return (babel) => {
      const { types: t } = babel;
      return {
        visitor: {
          Program(path) {
            const body = path.get('body');
            const defaultExport = body
              .map((path) => {
                if (!path.isExportDefaultDeclaration()) return null;
                return path.get('declaration');
              })
              .find(Boolean);
            if (!defaultExport) throw new Error('Missing default export');
            const defaultExportValue = defaultExport.isIdentifier()
              ? path.scope.getBinding(defaultExport.node.name)?.path.get('init')
              : defaultExport;
            if (!defaultExport) throw new Error('Invalid default export');
            if (!defaultExportValue.isArrayExpression()) {
              throw new Error('Default export must be an array');
            }
            defaultExportValue.replaceWith(
              t.arrayExpression([
                ...defaultExportValue.node.elements,
                t.identifier(transformIdentifier),
              ]),
            );
          },
        },
      };
    };
  }

  function addTransformManifestToCodemodManifest(transformIdentifier) {
    return (babel) => {
      const { types: t } = babel;
      return {
        visitor: {
          Program(path) {
            const body = path.get('body');
            const defaultExport = body
              .map((path) => {
                if (!path.isExportDefaultDeclaration()) return null;
                return path.get('declaration');
              })
              .find(Boolean);
            if (!defaultExport) throw new Error('Missing default export');
            const defaultExportValue = defaultExport.isIdentifier()
              ? path.scope.getBinding(defaultExport.node.name)?.path.get('init')
              : defaultExport;
            if (!defaultExport) throw new Error('Invalid default export');
            if (!defaultExportValue.isObjectExpression()) {
              throw new Error('Default export must be an object');
            }
            const transformsProperty = defaultExportValue
              .get('properties')
              .find(
                (property) =>
                  property.isObjectProperty() && property.node.key.name === 'transforms',
              );
            if (!transformsProperty) {
              throw new Error('Default export is missing "transforms" property');
            }
            const transformsPropertyValue = transformsProperty.get('value');
            const transformsValue = transformsPropertyValue.isIdentifier()
              ? path.scope.getBinding(transformsPropertyValue.node.name)?.path.get('init')
              : transformsPropertyValue;
            if (!transformsValue.isArrayExpression()) {
              throw new Error('Transforms property must be an array');
            }
            transformsValue.replaceWith(
              t.arrayExpression([
                ...transformsValue.node.elements,
                t.identifier(transformIdentifier),
              ]),
            );
          },
        },
      };
    };
  }
}

export async function addReleaseToVersionsManifest({
  versionsPath,
  versionManifestPath,
  versionIdentifier,
}) {
  return transformFile(versionsPath, {
    plugins: [
      addModuleImports(
        ast.statement`
        import ${versionIdentifier} from '${getModuleImportPath(versionManifestPath, {
          currentPath: versionsPath,
        })}';
      `,
      ),
      addReleaseVersionToVersionsManifest(versionIdentifier),
    ],
    prettier: true,
  });

  function addReleaseVersionToVersionsManifest(transformIdentifier) {
    return (babel) => {
      const { types: t } = babel;
      return {
        visitor: {
          Program(path) {
            const body = path.get('body');
            const defaultExport = body
              .map((path) => {
                if (!path.isExportDefaultDeclaration()) return null;
                return path.get('declaration');
              })
              .find(Boolean);
            if (!defaultExport) throw new Error('Missing default export');
            const defaultExportValue = defaultExport.isIdentifier()
              ? path.scope.getBinding(defaultExport.node.name)?.path.get('init')
              : defaultExport;
            if (!defaultExport) throw new Error('Invalid default export');
            if (!defaultExportValue.isArrayExpression()) {
              throw new Error('Default export must be an array');
            }
            defaultExportValue.replaceWith(
              t.arrayExpression([
                ...defaultExportValue.node.elements,
                t.identifier(transformIdentifier),
              ]),
            );
          },
        },
      };
    };
  }
}

export async function addReleaseToVersionsManifestTests({ manifestTestPath, version }) {
  return transformFile(manifestTestPath, {
    plugins: [addReleaseVersionToVersionsManifestTests(version)],
    prettier: true,
  });

  function addReleaseVersionToVersionsManifestTests(version) {
    return (babel) => {
      const { types: t } = babel;
      return {
        visitor: {
          Program(path) {
            const versionsArray = path.scope.getBinding('versions')?.path.get('init');
            if (!versionsArray) throw new Error('Missing "versions" array');
            if (!versionsArray.isArrayExpression())
              throw new Error('Unexpected "versions" array syntax');
            versionsArray.replaceWith(
              t.arrayExpression([...versionsArray.node.elements, t.stringLiteral(version)]),
            );
          },
        },
      };
    };
  }
}

function transformFile(
  filename,
  { plugins, format = 'js', transformSource = null, prettier = false },
) {
  return readFile(filename, 'utf-8')
    .then((source) => transformSource?.(source) ?? source)
    .then((source) => (format === 'json' ? addParentheses(source) : source))
    .then((source) => {
      const transformedSource = applyBabelTransform(source, plugins, {
        filename,
        jsx: format === 'jsx',
        sourceType: format === 'json' ? 'script' : 'module',
        print: {
          quote: format === 'json' ? 'double' : 'single',
        },
      });
      return transformedSource ?? null;
    })
    .then((source) => (format === 'json' ? removeParentheses(source) : source))
    .then((source) =>
      prettier
        ? loadPrettierConfig(filename).then((config) =>
            applyPrettierFormat(source, {
              filepath: filename,
              ...config,
            }),
          )
        : source,
    )
    .then((source) => writeFile(filename, source).then(() => source))
    .catch((error) => {
      if (error instanceof Error) {
        error.message = `Unable to transform ${filename}\n\n${error.message}`;
      }
      throw error;
    });
}

function getModuleImportPath(importedPath, { currentPath }) {
  return ensureLocalImportPath(relative(dirname(currentPath), importedPath));
}

function ensureLocalImportPath(path) {
  return path.startsWith('.') || path.startsWith('/') ? path : `./${path}`;
}

function parseBabelAst(source, context) {
  const { filename, jsx, sourceType, js: parserOptions = {} } = context;
  const defaultPlugins = jsx ? JSX_PARSER_PLUGINS : JS_PARSER_PLUGINS;
  return parse(source, {
    parser: {
      sourceFilename: filename,
      parse(source) {
        const { plugins } = parserOptions;
        return parseAst(source, {
          ...parserOptions,
          sourceType,
          sourceFilename: filename,
          plugins: plugins ? [...defaultPlugins, ...plugins] : defaultPlugins,
          tokens: true,
        });
      },
    },
  });
}

function applyBabelTransform(source, plugins, context) {
  const { print: printOptions = {}, ...parserContext } = context;
  // Attempt to determine input file line endings, defaulting to the operating system default
  const crlfLineEndings = source.includes('\r\n');
  const lfLineEndings = !crlfLineEndings && source.includes('\n');
  const lineTerminator = crlfLineEndings ? '\r\n' : lfLineEndings ? '\n' : undefined;
  // Parse the source AST
  const ast = parseBabelAst(source, parserContext);
  // Transform the AST
  const transformedAst = transformAst(ast, plugins, parserContext, { source });
  // Print the transformed AST
  const transformedSource = transformedAst
    ? print(transformedAst, {
        lineTerminator,
        ...printOptions,
      }).code
    : null;
  return transformedSource;
}

function addModuleImports(imports) {
  return function addModuleImports(babel) {
    return {
      visitor: {
        Program(path) {
          const finalExistingImport = path
            .get('body')
            .slice()
            .reverse()
            .find((path) => path.isImportDeclaration());
          if (finalExistingImport) {
            finalExistingImport.insertAfter(imports);
          } else {
            path.unshiftContainer('body', imports);
          }
        },
      },
    };
  };
}
