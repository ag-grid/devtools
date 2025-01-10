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
  usingCharts: boolean;
  chartType: string;
};

const manifest: VersionManifest<Choices33> = {
  version: '33.0.0',
  codemodPath: 'versions/33.0.0',
  transforms,
  choices: {
    usingCharts: () => {
      return select({
        message:
          'Are you using chart based features in any of your grids, i.e Sparklines / Integrated Charts?',
        default: false,
        choices: [
          {
            value: true,
            name: 'Yes',
            description: 'Some grid has Sparklines in cells or is using Integrated Charts.',
          },
          {
            value: false,
            name: 'No',
            description: 'No charting based features used in any of the grids.',
          },
        ],
      });
    },
    chartType: () => {
      if (process.env.AG_IS_USING_CHARTS == 'false') {
        // If they are using community packages, they are not using AG Charts
        return Promise.resolve('none');
      }

      return select({
        message: 'Are you using AG Charts Community or Enterprise?',
        default: 'community',
        choices: [
          {
            value: 'community',
            name: 'Community',
            description:
              'Using the Community version of AG Charts via one of: ag-grid-enterprise / @ag-grid-enterprise/charts',
          },
          {
            value: 'enterprise',
            name: 'Enterprise',
            description:
              'Using the Enterprise version of AG Charts via one of: ag-grid-charts-enterprise / @ag-grid-enterprise/charts-enterprise',
          },
        ],
      });
    },
  },
  setAnswers: {
    usingCharts: (answer) => {
      process.env.AG_IS_USING_CHARTS = answer;
    },
    chartType: (answers) => {
      process.env.AG_USING_CHARTS = answers;
    },
  },
};

export default manifest;
