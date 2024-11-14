import { TestImport } from '@ag-grid-community/core';

import { AgSparklineOptions } from "ag-charts-types";

const test = {
  sparklineOptions: {
    tooltip: {
      renderer: tooltipRenderer,
    },
  } as AgSparklineOptions,
}

const ggg = {
  notASparkline: {
    tooltip: {
      renderer: tooltipRenderer,
    },
  }
}