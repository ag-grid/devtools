import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { stdin, stderr } from 'node:process';
import {
  getPackageJsonPath,
  green,
  prompt,
  validateDirectory,
} from '@ag-grid-devtools/build-tools';

import {
  addTransformToVersion,
  getLatestReleaseVersion,
  retrieveExistingVersions,
} from './src/version.mjs';
import { validateOneOf } from '../../build-tools/src/validate.mjs';

const __dirname = dirname(new URL(import.meta.url).pathname);

const PROJECT_TRANSFORMS_DIR = './src/transforms';
const PROJECT_VERSIONS_DIR = './src/versions';

const VARIABLES = [
  {
    name: 'projectRoot',
    label: 'Project root directory',
    options: () => ({
      value: dirname(getPackageJsonPath(__dirname)),
      validate: validateDirectory,
    }),
  },
  {
    name: 'transformsDir',
    label: 'Transforms directory',
    options: ({ projectRoot }) => ({
      value: join(projectRoot, PROJECT_TRANSFORMS_DIR),
      validate: validateDirectory,
    }),
  },
  {
    name: 'versionsDir',
    label: 'Codemod versions directory',
    options: ({ projectRoot }) => ({
      value: join(projectRoot, PROJECT_VERSIONS_DIR),
      validate: validateDirectory,
    }),
  },
  {
    name: 'version',
    label: 'Codemod release version',
    options: ({ versionsDir }) => {
      const options = retrieveExistingVersions(versionsDir);
      return {
        prompt: 'Which codemod release version would you like to update?',
        options,
        default: getProjectLatestReleaseVersion(versionsDir),
        validate: validateOneOf(options),
      };
    },
  },
  {
    name: 'transform',
    label: 'Transform name',
    options: ({ transformsDir }) => {
      const options = retrieveExistingTransforms(transformsDir);
      return {
        prompt: 'Which transform would you like to include?',
        options,
        validate: validateOneOf(options),
      };
    },
  },
  {
    name: 'transformIdentifier',
    label: 'Transform identifier for use in source code replacements',
    options: ({ transform }) => ({
      value: camelCase(transform),
    }),
  },
];

export default async function task(...args) {
  const variables = await prompt(VARIABLES, { args, input: stdin, output: stderr });
  if (!variables) throw null;
  const { versionsDir, version, transformsDir, transform, transformIdentifier } = variables;
  await addTransformToVersion({
    versionPath: join(versionsDir, version),
    transformPath: join(transformsDir, transform),
    transformIdentifier,
  });
  process.stderr.write(
    [
      '',
      ...(version ? [`Added transform ${green(transform)} to version ${green(version)}`] : []),
      '',
    ].join('\n'),
  );
}

function getProjectLatestReleaseVersion(versionsDir) {
  const versions = getProjectReleaseVersions(versionsDir);
  if (!versions) return null;
  return getLatestReleaseVersion(versions);
}

function getProjectReleaseVersions(versionsDir) {
  try {
    return retrieveExistingVersions(versionsDir);
  } catch {
    return null;
  }
}

export function retrieveExistingTransforms(transformsDir) {
  return readdirSync(transformsDir).filter((filename) =>
    statSync(join(transformsDir, filename)).isDirectory(),
  );
}

function camelCase(value) {
  return (
    value
      // Replace number separators with underscores
      .replace(/(\d)-+(\d)/g, '$1_$2')
      // Replace kebab-case with camelCase
      .replace(/-+(?:(\w)|$)/g, (_, char) => (char ? char.toUpperCase() : ''))
  );
}
