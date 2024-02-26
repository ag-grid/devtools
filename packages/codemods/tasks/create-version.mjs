import { join, dirname } from 'node:path';
import { stdin, stderr } from 'node:process';
import {
  copyTemplateFiles,
  getPackageJsonPath,
  green,
  prompt,
  validateDirectory,
  validateEmptyPath,
} from '@ag-grid-devtools/build-tools';

import {
  isValidReleaseVersion,
  retrieveExistingVersions,
  getNextReleaseVersion,
} from './src/version.mjs';

const __dirname = dirname(new URL(import.meta.url).pathname);
const TEMPLATE_DIR = join(__dirname, '../templates/create-version');

const PROJECT_VERSIONS_DIR = './src/versions';

const VARIABLES = [
  {
    name: 'projectRoot',
    label: 'Project root directory',
    value: () => dirname(getPackageJsonPath(__dirname)),
    validate: validateDirectory,
  },
  {
    name: 'versionsDir',
    label: 'Codemod versions directory',
    value: ({ projectRoot }) => join(projectRoot, PROJECT_VERSIONS_DIR),
    validate: validateDirectory,
  },
  {
    name: 'version',
    label: 'Codemod version',
    default: ({ versionsDir }) => {
      const versions = retrieveExistingVersions(versionsDir);
      return getNextReleaseVersion(versions, 'minor');
    },
    validate: validateReleaseVersion,
  },
  {
    name: 'outputPath',
    label: 'Template output path',
    value: ({ versionsDir, version }) => join(versionsDir, version),
    validate: validateEmptyPath,
  },
  {
    name: 'versionIdentifier',
    label: 'Version identifier for use in source code replacements',
    value: ({ version }) => version.replace(/\./g, '_'),
    validate: validateVersionIdentifier,
  },
];

export default async function task(...args) {
  const variables = await prompt(VARIABLES, { args, input: stdin, output: stderr });
  if (!variables) throw null;
  const { outputPath, version } = variables;
  await copyTemplateFiles(TEMPLATE_DIR, outputPath, variables);
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
