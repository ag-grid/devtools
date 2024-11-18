// @ts-nocheck
import { TestImport } from '@ag-grid-community/core';

import { AgSparklineOptions } from "ag-charts-types";

const tooltipRenderer = (params: any) => {};

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
  } as AgSparklineOptions,
}