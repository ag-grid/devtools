import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const TEMPLATE_OPTIONS = {
  plugins: ['jsx', 'typescript', 'decorators-legacy'],
};

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

const ast = {
  statement(literals, ...interpolations) {
    return template.statement(TEMPLATE_OPTIONS).ast(literals, ...interpolations);
  },
};

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
