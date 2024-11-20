// @ts-nocheck
import type { AgSparklineOptions } from 'ag-charts-enterprise';

const test = {
  cellRendererParams: {
    sparklineOptions: {
      crosshair: {
        enabled: true,
        lineDash: [3, 3],
        stroke: '#999',
      },
    } as LineSparklineOptions,
  }
}
