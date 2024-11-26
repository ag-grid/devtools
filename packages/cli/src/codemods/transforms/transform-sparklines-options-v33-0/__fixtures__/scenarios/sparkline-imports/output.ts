// @ts-nocheck
import { TestImport } from '@ag-grid-community/core';

import type { AgSparklineOptions } from "ag-charts-community";

const tooltipRenderer = (params: any) => {};

const test = {
  sparklineOptions: {
    tooltip: {
      renderer: tooltipRenderer
    }
  } as AgSparklineOptions
}

const ggg = {
  notASparkline: {
    tooltip: {
      renderer: tooltipRenderer
    }
  } as AgSparklineOptions
}