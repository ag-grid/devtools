import { ast } from '@ag-grid-devtools/ast/dist/lib/lib.js';
import { replaceVariables } from '@ag-grid-devtools/build-tools';
import {
  addModuleImports,
  applyBabelTransform,
  applyPrettierFormat,
  createBabelPlugin,
  loadPrettierConfig,
  parseBabelAst,
} from '@ag-grid-devtools/codemod-utils/dist/lib/lib.js';
import { readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

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
    return createBabelPlugin((babel) => {
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
    });
  }

  function addTransformManifestToCodemodManifest(transformIdentifier) {
    return createBabelPlugin((babel) => {
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
    });
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
    return createBabelPlugin((babel) => {
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
    });
  }
}

export async function addReleaseToVersionsManifestTests({ manifestTestPath, version }) {
  return transformFile(manifestTestPath, {
    plugins: [addReleaseVersionToVersionsManifestTests(version)],
    prettier: true,
  });

  function addReleaseVersionToVersionsManifestTests(version) {
    return createBabelPlugin((babel) => {
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
    });
  }
}

export async function addReleaseToPackageJsonExports(packageJsonPath, { version, templatePath }) {
  const templateAst = await parseJsonFile(templatePath, {
    transformSource: (source) => replaceVariables(source, { version }),
  });
  return transformFile(packageJsonPath, {
    format: 'json',
    plugins: [mergeJsonFields(templateAst)],
    prettier: true,
  });

  function mergeJsonFields(fields) {
    return createBabelPlugin((babel) => {
      return {
        visitor: {
          ObjectExpression(path) {
            deepMergeJsonAstObjectFields(path, fields);
            path.skip();
          },
        },
      };
    });
  }

  function deepMergeJsonAstObjectFields(path, valueNode) {
    if (!path.isObjectExpression() || valueNode.type !== path.node.type) {
      path.replaceWith(valueNode);
      return;
    }
    const existingProperties = path.get('properties');
    for (const property of valueNode.properties) {
      const existingProperty = existingProperties.find(
        (existingProperty) => existingProperty.get('key').node.value === property.key.value,
      );
      if (existingProperty) {
        deepMergeJsonAstObjectFields(existingProperty.get('value'), property.value);
      } else {
        path.node.properties.push(property);
      }
    }
  }
}

function getModuleImportPath(importedPath, { currentPath }) {
  return ensureLocalImportPath(relative(dirname(currentPath), importedPath));
}

function ensureLocalImportPath(path) {
  return path.startsWith('.') || path.startsWith('/') ? path : `./${path}`;
}

async function parseJsonFile(filename, { transformSource }) {
  const ast = await parseFile(filename, { format: 'json', transformSource });
  const rootNodes = ast.program.body;
  const rootNode =
    rootNodes.length === 1 && rootNodes[0].type === 'ExpressionStatement' ? rootNodes[0] : null;
  if (!rootNode) throw new Error(`Invalid json file contents: ${filename}`);
  return rootNode.expression;
}

function parseFile(filename, { format = 'js', transformSource = null }) {
  return readFile(filename, 'utf-8')
    .then((source) => transformSource?.(source) ?? source)
    .then((source) => (format === 'json' ? addParentheses(source) : source))
    .then((source) =>
      parseBabelAst(source, {
        filename,
        jsx: format === 'jsx',
        sourceType: format === 'json' ? 'script' : 'module',
      }),
    );
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

function addParentheses(source) {
  return `(${source})`;
}

function removeParentheses(source) {
  if (source.charAt(0) !== '(' || source.charAt(source.length - 1) !== ')') {
    throw new Error(
      'Invalid source transformation: expected result expression to be wrapped in parentheses',
    );
  }
  return source.slice(1, source.length - 1);
}
