import { type TransformManifest, type VersionManifest } from '@ag-grid-devtools/types';

import transformGridApiMethodsV33_0 from '../../transforms/transform-grid-api-methods-v33-0/manifest.ts';

import transformSparklinesOptionsV33_0 from '../../transforms/transform-sparklines-options-v33-0/manifest.ts';

import transformModulesToPackagesV33 from '../../transforms/transform-modules-to-packages-v33/manifest.ts';
import { checkbox, select } from '@inquirer/prompts';

const transforms: Array<TransformManifest> = [
  transformGridApiMethodsV33_0,
  transformSparklinesOptionsV33_0,
  transformModulesToPackagesV33,
];

type Choices33 = {
  fromFormat: string;
  chartType: string;
  communityAllModules: string;
};

const manifest: VersionManifest<Choices33> = {
  version: '33.0.0',
  codemodPath: 'versions/33.0.0',
  transforms,
  choices: {
    fromFormat: () =>
      // are they using packages / modules and community or enterprise
      select({
        message: 'In versions <= v32 are you using AG Modules or AG Packages?',
        default: 'packages',
        choices: [
          {
            value: 'packages',
            name: 'Community AG Grid Package (ag-grid-community)',
            description:
              'Examples of AG Community Packages: ag-grid-community / ag-grid-react / ag-grid-angular / ag-grid-vue3',
          },
          {
            value: 'enterprisePackages',
            name: 'Enterprise AG Grid Package (ag-grid-enterprise / ag-grid-charts-enterprise)',
            description:
              'Examples of AG Enterprise Package: ag-grid-enterprise / ag-grid-charts-enterprise',
          },
          {
            value: 'modules',
            name: 'Community AG Modules (@ag-grid-community/**)',
            description:
              'Using AG Modules, i.e @ag-grid-community/core / @ag-grid-community/react / @ag-grid-community/angular / @ag-grid-community/vue3',
          },
          {
            value: 'enterpriseModules',
            name: 'Enterprise AG Modules (@ag-grid-enterprise/**)',
            description: 'Using AG Modules, i.e @ag-grid-enterprise/set-filter',
          },
        ],
      }),

    chartType: () => {
      if (process.env.AG_PREVIOUS_FORMAT === 'packages') {
        // If they are using community packages, they are not using AG Charts
        return Promise.resolve('none');
      }

      return select({
        message: 'Are you using AG Charts features? If so Community or Enterprise?',
        default: 'community',
        choices: [
          {
            value: 'none',
            name: 'Not using Integrated Charts / Sparklines',
            description:
              'No charting based features used in the grids, i.e no sparklines or Integrated Charts.',
          },
          {
            value: 'community',
            name: 'Using Community Charts via one of: ag-grid-enterprise / @ag-grid-enterprise/charts',
            description: 'Using the Community version of AG Charts',
          },
          {
            value: 'enterprise',
            name: 'Using Enterprise Charts via one of: ag-grid-charts-enterprise / @ag-grid-enterprise/charts-enterprise',
            description: 'Using the Enterprise version of AG Charts',
          },
        ],
      });
    },
    communityAllModules: () => {
      if (process.env.AG_PREVIOUS_FORMAT === 'packages') {
        // If they are using community packages, they are not using AG Charts
        return checkbox({
          message: 'Do you want to include all Community modules?',
          choices: [
            {
              value: true,
              name: 'All Community modules',
              description: 'Include all Community modules in your project',
            },
          ],
        });
      }

      return Promise.resolve(false);
    },
  },
  setAnswers: {
    fromFormat: (answer) => {
      process.env.AG_PREVIOUS_FORMAT = answer;
      console.log(`AG_PREVIOUS_FORMAT set to ${process.env.AG_PREVIOUS_FORMAT}`);
    },
    chartType: (answers) => {
      process.env.AG_USING_CHARTS = answers;
      console.log(`AG_USING_CHARTS set to ${process.env.AG_USING_CHARTS}`);
    },
    communityAllModules: (answer) => {
      process.env.AG_ADD_ALL_COMMUNITY_MODULES = answer;
      console.log(
        `AG_ADD_ALL_COMMUNITY_MODULES set to ${process.env.AG_ADD_ALL_COMMUNITY_MODULES}`,
      );
    },
  },
};

export default manifest;
