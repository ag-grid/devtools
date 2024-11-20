import { ImportSpecifierOption } from '../types';

export const oldImports: ImportSpecifierOption[] = [
  'AreaSparklineOptions',
  'BarSparklineOptions',
  'ColumnSparklineOptions',
  'LineSparklineOptions',
];
export const newImport: ImportSpecifierOption = {
  name: 'AgSparklineOptions',
  type: 'type',
};
export const newPackage = 'ag-charts-community';

export const oldTypes: string[] = oldImports.map((io) => (typeof io === 'string' ? io : io.name));

export const newType: string = 'AgSparklineOptions';
