export const communityPackage = 'ag-grid-community';
export const enterprisePackage = 'ag-grid-enterprise';

export const reactModule = '@ag-grid-community/react';
export const reactPackage = 'ag-grid-react';

export const vueModule = '@ag-grid-community/vue3';
export const vuePackage = 'ag-grid-vue3';

export const angularModule = '@ag-grid-community/angular';
export const angularPackage = 'ag-grid-angular';

export const AllCommunityModule = 'AllCommunityModule';
export const communityCoreModule = '@ag-grid-community/core';

export const communityModules = [
  '@ag-grid-community/core',
  '@ag-grid-community/client-side-row-model',
  '@ag-grid-community/infinite-row-model',
  '@ag-grid-community/csv-export',
];

export const sparklinesModule = '@ag-grid-enterprise/sparklines';
export const SparklinesModule = 'SparklinesModule';
export const gridChartsModule = '@ag-grid-enterprise/charts';
export const gridChartsEnterpriseModule = '@ag-grid-enterprise/charts-enterprise';
export const GridChartsModule = 'GridChartsModule';
export const IntegratedChartsModule = 'IntegratedChartsModule';

export const RangeSelectionModule = 'RangeSelectionModule';
export const CellSelectionModule = 'CellSelectionModule';

export const gridRowModelModules = [
  'ClientSideRowModelModule',
  'ServerSideRowModelModule',
  'InfiniteRowModelModule',
  'ViewportRowModelModule',
];

export const AgChartsCommunityModule = 'AgChartsCommunityModule';
export const AgChartsEnterpriseModule = 'AgChartsEnterpriseModule';
export const chartsCommunityPackage = 'ag-charts-community';
export const chartsEnterprisePackage = 'ag-charts-enterprise';

export const enterpriseModules = [
  '@ag-grid-enterprise/core',
  gridChartsModule,
  gridChartsEnterpriseModule,
  sparklinesModule,
  '@ag-grid-enterprise/clipboard',
  '@ag-grid-enterprise/column-tool-panel',
  '@ag-grid-enterprise/excel-export',
  '@ag-grid-enterprise/filter-tool-panel',
  '@ag-grid-enterprise/master-detail',
  '@ag-grid-enterprise/menu',
  '@ag-grid-enterprise/range-selection',
  '@ag-grid-enterprise/rich-select',
  '@ag-grid-enterprise/row-grouping',
  '@ag-grid-enterprise/server-side-row-model',
  '@ag-grid-enterprise/set-filter',
  '@ag-grid-enterprise/multi-filter',
  '@ag-grid-enterprise/advanced-filter',
  '@ag-grid-enterprise/side-bar',
  '@ag-grid-enterprise/status-bar',
  '@ag-grid-enterprise/viewport-row-model',
];

export function sortImports(imports: any[]) {
  return imports.sort((a: any, b: any) => {
    if (a.imported.name < b.imported.name) {
      return -1;
    } else if (a.imported.name > b.imported.name) {
      return 1;
    } else {
      return 0;
    }
  });
}

export function sortIdentifiers(identifiers: any[]) {
  return identifiers.sort((a: any, b: any) => {
    const aName = typeof a.name == 'string' ? a.name : 'Z';
    const bName = typeof b.name == 'string' ? b.name : 'Z';
    if (aName < bName) {
      return -1;
    } else if (aName > bName) {
      return 1;
    } else {
      return 0;
    }
  });
}

export function isSorted(list: string[]): boolean {
  for (let i = 0; i < list.length - 1; i++) {
    if (list[i] > list[i + 1]) {
      return false;
    }
  }
  return true;
}
