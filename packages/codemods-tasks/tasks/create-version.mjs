import { join, resolve, dirname, basename, extname } from 'node:path';
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
  getNextReleaseVersion,
  isValidReleaseVersion,
  retrieveExistingVersions,
} from './src/version.mjs';

const __dirname = dirname(new URL(import.meta.url).pathname);

const TEMPLATE_DIR = join(__dirname, '../templates/create-version');
const CODEMOD_TEMPLATE_DIR = join(TEMPLATE_DIR, 'codemod');
const EXPORTS_TEMPLATE_DIR = join(TEMPLATE_DIR, 'exports');

const PROJECT_VERSIONS_DIR = './versions';
const MANIFEST_FILENAME = 'manifest.ts';
const MANIFEST_TEST_PATH = './lib.test.ts';

const VARIABLES = [
  {
    name: 'projectRoot',
    label: 'Project root directory',
    options: () => ({
      value: resolve(dirname(getPackageJsonPath(__dirname)), '../cli/src/codemods'),
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
    name: 'versionsManifestPath',
    label: 'Codemod versions manifest path',
    options: ({ versionsDir }) => ({
      value: join(versionsDir, MANIFEST_FILENAME),
      validate: validateFile,
    }),
  },
  {
    name: 'versionsManifestTestPath',
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
    name: 'versionManifestPath',
    label: 'Codemod manifest path',
    options: ({ outputPath }) => ({
      value: join(outputPath, MANIFEST_FILENAME),
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
  const {
    projectRoot,
    outputPath,
    exportsDir,
    versionManifestPath,
    versionsManifestPath,
    versionsManifestTestPath,
    version,
    versionIdentifier,
  } = variables;
  await copyTemplateDirectory(CODEMOD_TEMPLATE_DIR, outputPath, variables);
  await copyTemplateDirectory(EXPORTS_TEMPLATE_DIR, exportsDir, variables);
  await addReleaseToVersionsManifest({
    versionsPath: versionsManifestPath,
    versionManifestPath: stripFileExtension(versionManifestPath),
    versionIdentifier: `v${versionIdentifier}`,
  });
  await addReleaseToVersionsManifestTests({ manifestTestPath: versionsManifestTestPath, version });
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

function stripFileExtension(path) {
  return join(dirname(path), basename(path, extname(path)));
}
