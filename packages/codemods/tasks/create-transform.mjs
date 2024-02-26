import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { stdin, stderr } from 'node:process';
import {
  copyTemplateFiles,
  formatOptionalString,
  getPackageJsonPath,
  green,
  parseOptionalString,
  prompt,
  validateDirectory,
  validateEmptyPath,
} from '@ag-grid-devtools/build-tools';

import {
  getLatestReleaseVersion,
  retrieveExistingVersions,
  parseReleaseVersion,
} from './src/version.mjs';

const __dirname = dirname(new URL(import.meta.url).pathname);
const TEMPLATE_DIR = join(__dirname, '../templates/create-transform');

const PROJECT_PLUGINS_DIR = './src/plugins';
const PROJECT_TRANSFORMS_DIR = './src/transforms';
const PROJECT_VERSIONS_DIR = './src/versions';

const VARIABLES = [
  {
    name: 'projectRoot',
    label: 'Project root directory',
    value: () => dirname(getPackageJsonPath(__dirname)),
    validate: validateDirectory,
  },
  {
    name: 'pluginsDir',
    label: 'Plugins directory',
    value: ({ projectRoot }) => join(projectRoot, PROJECT_PLUGINS_DIR),
    validate: validateDirectory,
  },
  {
    name: 'transformsDir',
    label: 'Transforms directory',
    value: ({ projectRoot }) => join(projectRoot, PROJECT_TRANSFORMS_DIR),
    validate: validateDirectory,
  },
  {
    name: 'plugin',
    label: 'Plugin template (optional)',
    parse: parseOptionalString,
    format: formatOptionalString,
    validate: validatePlugin,
  },
  {
    name: 'name',
    label: 'Enter a human-readable name for the transform',
    default: ({ plugin, pluginsDir, projectRoot }) =>
      plugin ? generatePluginTransformName({ plugin, pluginsDir, projectRoot }) : '',
    validate: validateTransformLabel,
  },
  {
    name: 'description',
    label: 'Transform description',
    default: ({ plugin, pluginsDir }) =>
      plugin ? generatePluginTransformDescription({ plugin, pluginsDir }) : '',
  },
  {
    name: 'filename',
    label: 'Transform filename',
    default: ({ name }) => kebabCase(name),
    validate: validateTransformName,
  },
  {
    name: 'identifier',
    label: 'Transform identifier for use in source code replacements',
    value: ({ filename }) => camelCase(filename),
  },
  {
    name: 'outputPath',
    label: 'Template output path',
    value: ({ transformsDir, filename }) => join(transformsDir, filename),
    validate: validateEmptyPath,
  },
];

export default async function task(...args) {
  const variables = await prompt(VARIABLES, { args, input: stdin, output: stderr });
  if (!variables) throw null;
  const { outputPath, filename, pluginsDir, plugin } = variables;
  const pluginTemplate = plugin ? getPluginTemplatePath({ pluginsDir, plugin }) : null;
  const templateDir = pluginTemplate ?? TEMPLATE_DIR;
  await copyTemplateFiles(templateDir, outputPath, variables);
  process.stderr.write(`\nCreated transform ${green(filename)} in ${outputPath}\n`);
}

function validateTransformLabel(value) {
  if (typeof value !== 'string' || value.length === 0) return `Invalid transform name: "${value}"`;
  return null;
}

function validateTransformName(value) {
  if (!isValidTransformName(value)) return `Invalid transform name: "${value}"`;
  return null;
}

function validatePlugin(value, { pluginsDir }) {
  if (value) return validatePluginName(value, { pluginsDir });
  return null;
}

function validatePluginName(value, { pluginsDir }) {
  const error = validateDirectory(join(pluginsDir, value));
  if (typeof error === 'string') {
    return [
      `Invalid plugin name: "${value}"`,
      `  ${error}`,
      `  Available plugins:`,
      ...readdirSync(pluginsDir).map((name) => `    - ${name}`),
    ].join('\n');
  }
  return null;
}

function generatePluginTransformName({ plugin, pluginsDir, projectRoot }) {
  const { name } = loadPluginManifest({ plugin, pluginsDir });
  const latestVersion = getProjectReleaseVersion(projectRoot);
  const latestMinorVersion = latestVersion
    ? parseReleaseVersion(latestVersion).slice(0, 2).join('.')
    : null;
  const suffix = latestMinorVersion ? `v${latestMinorVersion}` : generateRandomHexChars(6);
  return `${name} ${suffix}`;
}

function generatePluginTransformDescription({ plugin, pluginsDir }) {
  const { description } = loadPluginManifest({ plugin, pluginsDir });
  return description;
}

function getProjectReleaseVersion(projectRoot) {
  const versionsDir = join(projectRoot, PROJECT_VERSIONS_DIR);
  try {
    const versions = retrieveExistingVersions(versionsDir);
    return getLatestReleaseVersion(versions);
  } catch {
    return null;
  }
}

function loadPluginManifest({ plugin, pluginsDir }) {
  const pluginDir = join(pluginsDir, plugin);
  const pluginManifestPath = join(pluginDir, 'plugin.json');
  return JSON.parse(readFileSync(pluginManifestPath, 'utf-8'));
}

function getPluginTemplatePath({ pluginsDir, plugin }) {
  const pluginPath = join(pluginsDir, plugin);
  const { template } = loadPluginManifest({ plugin, pluginsDir });
  return join(pluginPath, template);
}

function isValidTransformName(value) {
  return /^[a-z]+(-[a-z0-9]+)*$/i.test(value);
}

function kebabCase(value) {
  return value.replace(/\W+/g, '-').toLowerCase();
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

function generateRandomHexChars(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}
