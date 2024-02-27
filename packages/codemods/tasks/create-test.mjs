import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { stdin, stderr } from 'node:process';
import {
  copyTemplateDirectory,
  getPackageJsonPath,
  green,
  prompt,
  validateOneOf,
  validateDirectory,
  validateEmptyPath,
} from '@ag-grid-devtools/build-tools';

import { getLatestReleaseVersion, retrieveExistingVersions } from './src/version.mjs';

const __dirname = dirname(new URL(import.meta.url).pathname);
const TEMPLATE_DIR = join(__dirname, '../templates/create-test');

const PROJECT_PLUGINS_DIR = './src/plugins';
const PROJECT_TRANSFORMS_DIR = './src/transforms';
const PROJECT_VERSIONS_DIR = './src/versions';

const SCENARIOS_DIR = '__fixtures__/scenarios';

const TEST_TYPE_TRANSFORM = 'transform';
const TEST_TYPE_RELEASE = 'version';
const TEST_TYPE_PLUGIN = 'plugin';
const TEST_TYPES = [TEST_TYPE_TRANSFORM, TEST_TYPE_RELEASE, TEST_TYPE_PLUGIN];

const FRAMEWORK_VANILLA = 'js';
const FRAMEWORK_REACT = 'jsx';
const FRAMEWORK_ANGULAR = 'angular';
const FRAMEWORK_VUE = 'vue';
const FRAMEWORKS = [FRAMEWORK_VANILLA, FRAMEWORK_REACT, FRAMEWORK_ANGULAR, FRAMEWORK_VUE];

const VANILLA_TEMPLATE_TYPE_DEFAULT = 'default';
const VANILLA_TEMPLATE_TYPES = [VANILLA_TEMPLATE_TYPE_DEFAULT];

const REACT_TEMPLATE_TYPE_DEFAULT = 'default';
const REACT_TEMPLATE_TYPES = [REACT_TEMPLATE_TYPE_DEFAULT];

const ANGULAR_TEMPLATE_TYPE_EXTERNAL = 'external';
const ANGULAR_TEMPLATE_TYPE_INLINE = 'inline';
const ANGULAR_TEMPLATE_TYPES = [ANGULAR_TEMPLATE_TYPE_EXTERNAL, ANGULAR_TEMPLATE_TYPE_INLINE];

const VUE_TEMPLATE_TYPE_SFC = 'sfc';
const VUE_TEMPLATE_TYPE_INLINE = 'inline';
const VUE_TEMPLATE_TYPES = [VUE_TEMPLATE_TYPE_SFC, VUE_TEMPLATE_TYPE_INLINE];

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
    label: 'Codemod versions',
    options: ({ projectRoot }) => ({
      value: join(projectRoot, PROJECT_VERSIONS_DIR),
      validate: validateDirectory,
    }),
  },
  {
    name: 'pluginsDir',
    label: 'Plugins directory',
    options: ({ projectRoot }) => ({
      value: join(projectRoot, PROJECT_PLUGINS_DIR),
      validate: validateDirectory,
    }),
  },
  {
    name: 'type',
    label: 'Test type',
    options: () => ({
      prompt: `Which type of test scenario is this? (${TEST_TYPES.join('/')})`,
      default: TEST_TYPE_TRANSFORM,
      validate: validateOneOf(TEST_TYPES),
    }),
  },
  {
    name: 'target',
    label: 'Target name',
    options: ({ type, transformsDir, versionsDir, pluginsDir }) => {
      switch (type) {
        case TEST_TYPE_TRANSFORM: {
          const options = getSubdirectories(transformsDir);
          return {
            prompt: 'Which transform does the test relate to?',
            validate: validateOneOf(options),
          };
        }
        case TEST_TYPE_RELEASE: {
          const options = getSubdirectories(versionsDir);
          return {
            prompt: 'Which release does the test relate to?',
            default: getProjectLatestReleaseVersion(versionsDir),
            validate: validateOneOf(options),
          };
        }
        case TEST_TYPE_PLUGIN: {
          const options = getSubdirectories(pluginsDir);
          return {
            prompt: 'Which plugin does the test relate to?',
            validate: validateOneOf(options),
          };
        }
      }
    },
  },
  {
    name: 'name',
    label: 'Scenario name',
    options: ({ type, target, transformsDir, versionsDir, pluginsDir }) => ({
      prompt:
        'What should the scenario be called? (machine-friendly, use slashes for nested scenarios)',
      validate: (value) => {
        const error = validateScenarioName(value);
        if (error != null) return error;
        return validateScenarioPath({
          type,
          target,
          transformsDir,
          versionsDir,
          pluginsDir,
          scenarioPath: join(SCENARIOS_DIR, value),
        });
      },
    }),
  },
  {
    name: 'scenarioPath',
    label: 'Scenario path',
    options: ({ type, target, transformsDir, versionsDir, pluginsDir, name }) => ({
      value: join(SCENARIOS_DIR, name),
      validate: (value) =>
        validateScenarioPath({
          type,
          target,
          transformsDir,
          versionsDir,
          pluginsDir,
          scenarioPath: value,
        }),
    }),
  },
  {
    name: 'framework',
    label: 'Test scenario framework',
    options: () => ({
      prompt: `Test scenario framework (${FRAMEWORKS.join('/')})`,
      default: FRAMEWORK_VANILLA,
      validate: validateOneOf(FRAMEWORKS),
    }),
  },
  {
    name: 'template',
    label: 'Framework template',
    options: ({ framework }) => {
      switch (framework) {
        case FRAMEWORK_VANILLA: {
          return {
            prompt: `JS template type (${VANILLA_TEMPLATE_TYPES.join(`/`)})`,
            value: VANILLA_TEMPLATE_TYPE_DEFAULT,
            validate: validateOneOf(VANILLA_TEMPLATE_TYPES),
          };
        }
        case FRAMEWORK_REACT: {
          return {
            prompt: `React template type (${REACT_TEMPLATE_TYPES.join(`/`)})`,
            value: VANILLA_TEMPLATE_TYPE_DEFAULT,
            validate: validateOneOf(VANILLA_TEMPLATE_TYPES),
          };
        }
        case FRAMEWORK_ANGULAR: {
          return {
            prompt: `Angular component template type (${ANGULAR_TEMPLATE_TYPES.join(`/`)})`,
            default: ANGULAR_TEMPLATE_TYPE_EXTERNAL,
            validate: validateOneOf(ANGULAR_TEMPLATE_TYPES),
          };
        }
        case FRAMEWORK_VUE: {
          return {
            prompt: `Vue component type (${VUE_TEMPLATE_TYPES.join(`/`)})`,
            default: VUE_TEMPLATE_TYPE_SFC,
            validate: validateOneOf(VUE_TEMPLATE_TYPES),
          };
        }
      }
    },
  },
];

export default async function task(...args) {
  const variables = await prompt(VARIABLES, { args, input: stdin, output: stderr });
  if (!variables) throw null;
  const {
    type,
    target,
    transformsDir,
    versionsDir,
    pluginsDir,
    scenarioPath,
    framework,
    template,
  } = variables;
  const targetPath = ((type) => {
    switch (type) {
      case TEST_TYPE_TRANSFORM:
        return join(transformsDir, target);
      case TEST_TYPE_RELEASE:
        return join(versionsDir, target);
      case TEST_TYPE_PLUGIN:
        return join(pluginsDir, target);
    }
  })(type);
  const outputPath = join(targetPath, scenarioPath);
  const templateDir = join(TEMPLATE_DIR, framework, template);
  await copyTemplateDirectory(templateDir, outputPath, variables);
  process.stderr.write(['', `Created test ${green(scenarioPath)} in ${outputPath}`, ''].join('\n'));
}

function validateScenarioName(value) {
  if (!isValidScenarioName(value)) return `Invalid scenario name: "${value}"`;
  return null;
}

function validateScenarioPath({
  type,
  target,
  transformsDir,
  versionsDir,
  pluginsDir,
  scenarioPath,
}) {
  switch (type) {
    case TEST_TYPE_TRANSFORM:
      return validateEmptyPath(join(transformsDir, target, scenarioPath));
    case TEST_TYPE_RELEASE:
      return validateEmptyPath(join(versionsDir, target, scenarioPath));
    case TEST_TYPE_PLUGIN:
      return validateEmptyPath(join(pluginsDir, target, scenarioPath));
  }
}

function isValidScenarioName(value) {
  return /^[\w\-\/]+$/.test(value);
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

function getSubdirectories(path) {
  return readdirSync(path).filter((name) => statSync(join(path, name)).isDirectory());
}
