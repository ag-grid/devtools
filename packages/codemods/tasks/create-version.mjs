import { join, dirname } from 'node:path';
import { stdin, stderr } from 'node:process';
import {
  copyTemplateDirectory,
  getPackageJsonPath,
  green,
  prompt,
  validateDirectory,
  validateEmptyPath,
  validateFile,
} from '@ag-grid-devtools/build-tools';

import {
  addReleaseToVersionsManifest,
  addReleaseToVersionsManifestTests,
  isValidReleaseVersion,
  retrieveExistingVersions,
  getNextReleaseVersion,
} from './src/version.mjs';

const __dirname = dirname(new URL(import.meta.url).pathname);
const TEMPLATE_DIR = join(__dirname, '../templates/create-version');

const PROJECT_VERSIONS_DIR = './src/versions';
const MANIFEST_FILENAME = 'manifest.ts';
const MANIFEST_TEST_PATH = './lib.test.ts';

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
    name: 'versionsDir',
    label: 'Codemod versions directory',
    options: ({ projectRoot }) => ({
      value: join(projectRoot, PROJECT_VERSIONS_DIR),
      validate: validateDirectory,
    }),
  },
  {
    name: 'manifestPath',
    label: 'Codemod manifest path',
    options: ({ versionsDir }) => ({
      value: join(versionsDir, MANIFEST_FILENAME),
      validate: validateFile,
    }),
  },
  {
    name: 'manifestTestPath',
    label: 'Codemod manifest test path',
    options: ({ projectRoot }) => ({
      value: join(projectRoot, MANIFEST_TEST_PATH),
      validate: validateFile,
    }),
  },
  {
    name: 'version',
    label: 'Codemod version',
    options: ({ versionsDir }) => {
      const versions = retrieveExistingVersions(versionsDir);
      return {
        default: getNextReleaseVersion(versions, 'minor'),
        validate: validateReleaseVersion,
      };
    },
  },
  {
    name: 'outputPath',
    label: 'Template output path',
    options: ({ versionsDir, version }) => ({
      value: join(versionsDir, version),
      validate: validateEmptyPath,
    }),
  },
  {
    name: 'versionIdentifier',
    label: 'Version identifier for use in source code replacements',
    options: ({ version }) => ({
      value: version.replace(/\./g, '_'),
      validate: validateVersionIdentifier,
    }),
  },
];

export default async function task(...args) {
  const variables = await prompt(VARIABLES, { args, input: stdin, output: stderr });
  if (!variables) throw null;
  const { outputPath, manifestPath, manifestTestPath, version, versionIdentifier } = variables;
  await copyTemplateDirectory(TEMPLATE_DIR, outputPath, variables);
  await addReleaseToVersionsManifest({
    versionsPath: manifestPath,
    versionManifestPath: join(outputPath, 'manifest'),
    versionIdentifier: `v${versionIdentifier}`,
  });
  await addReleaseToVersionsManifestTests({ manifestTestPath, version });
  process.stderr.write(`\nCreated codemod version ${green(version)} in ${outputPath}\n`);
}

function validateReleaseVersion(value) {
  if (!isValidReleaseVersion(value)) return `Invalid semver release: "${value}"`;
  return null;
}

function validateVersionIdentifier(value) {
  if (!isValidVersionIdentifier(value)) return `Invalid version identifier: "${value}"`;
  return null;
}

function isValidVersionIdentifier(value) {
  return /^\w*$/i.test(value);
}
