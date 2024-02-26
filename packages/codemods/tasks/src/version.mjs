import { ast } from '@ag-grid-devtools/ast/dist/lib/lib.js';
import { withErrorPrefix } from '@ag-grid-devtools/test-utils/dist/lib/lib.js';
import {
  addModuleImports,
  applyBabelTransform,
  createBabelPlugin,
} from '@ag-grid-devtools/codemod-utils/dist/lib/lib.js';
import { readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, relative } from 'node:path';

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

export async function addTransformToVersion({
  transformsPath,
  manifestPath,
  transformPath,
  transformManifestPath,
  transformIdentifier,
}) {
  return Promise.all([
    transformFile(transformsPath, [
      addModuleImports(
        ast.statement`
        import ${transformIdentifier} from '${getModuleImportPath(transformPath, {
          currentPath: transformsPath,
        })}';
      `,
      ),
      addTransformToCodemod(transformIdentifier),
    ]),
    transformFile(manifestPath, [
      addModuleImports(
        ast.statement`
        import ${transformIdentifier} from '${getModuleImportPath(transformManifestPath, {
          currentPath: transformsPath,
        })}';
      `,
      ),
      addTransformManifestToCodemodManifest(transformIdentifier),
    ]),
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
  return transformFile(versionsPath, [
    addModuleImports(
      ast.statement`
        import ${versionIdentifier} from '${getModuleImportPath(versionManifestPath, {
          currentPath: versionsPath,
        })}';
      `,
    ),
    addReleaseVersionToVersionsManifest(versionIdentifier),
  ]);

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
  return transformFile(manifestTestPath, [addReleaseVersionToVersionsManifestTests(version)]);

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

function getModuleImportPath(importedPath, { currentPath }) {
  return ensureLocalImportPath(relative(dirname(currentPath), importedPath));
}

function ensureLocalImportPath(path) {
  return path.startsWith('.') || path.startsWith('/') ? path : `./${path}`;
}

function transformFile(filename, plugins) {
  return readFile(filename, 'utf-8')
    .then((source) => {
      const updatedSource = applyBabelTransform(source, plugins, {
        filename,
        jsx: false,
        sourceType: 'module',
        print: {
          quote: 'single',
        },
      });
      if (updatedSource == null) return source;
      return writeFile(filename, updatedSource).then(() => updatedSource);
    })
    .catch((error) => {
      if (error instanceof Error) {
        error.message = `Unable to transform ${filename}\n\n${error.message}`;
      }
      throw error;
    });
}
