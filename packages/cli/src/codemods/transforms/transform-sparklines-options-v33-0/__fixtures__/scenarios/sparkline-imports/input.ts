// @ts-nocheck
import { LineSparklineOptions, AreaSparklineOptions, TestImport } from '@ag-grid-community/core';

const tooltipRenderer = (params: any) => {};

const test = {
  sparklineOptions: {
    tooltip: {
      renderer: tooltipRenderer,
    },
  } as LineSparklineOptions,
}

const ggg = {
  notASparkline: {
    tooltip: {
      renderer: tooltipRenderer,
    },
  } as AreaSparklineOptions,
}