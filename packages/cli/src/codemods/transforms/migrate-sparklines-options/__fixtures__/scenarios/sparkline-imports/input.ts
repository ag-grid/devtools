import { LineSparklineOptions, TestImport } from '@ag-grid-community/core';

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
  }
}