// @ts-nocheck
import { LineSparklineOptions } from '@ag-grid-community/core';

const test = {
  cellRendererParams: {
    sparklineOptions: {
      crosshairs: {
        xLine: {
            enabled: true,
            lineDash: 'dash',
            stroke: '#999',
        },
        yLine: {
            enabled: true,
            lineDash: 'dash',
            stroke: '#999',
        },
      },
    } as LineSparklineOptions,
  }
}
