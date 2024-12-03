import j from 'jscodeshift';

import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import {
  AgChartsCommunityModule,
  AgChartsEnterpriseModule,
  AllEnterpriseModule,
  enterpriseNpmPackage,
  gridChartsEnterpriseNpmPackage,
} from './constants';
import { addNewImportNextToGiven, getChartsImport } from './sharedUtils';
type UsingCharts = 'community' | 'enterprise' | 'none';
const LicenseManager = 'LicenseManager';

const moduleRegistry = j.expressionStatement(
  j.callExpression(
    j.memberExpression(j.identifier('ModuleRegistry'), j.identifier('registerModules')),
    [j.arrayExpression([j.identifier(AllEnterpriseModule)])],
  ),
);

const allEnterpriseWithCharts = (isEnterpriseCharts: boolean) =>
  j.callExpression(j.memberExpression(j.identifier(AllEnterpriseModule), j.identifier('with')), [
    j.identifier(isEnterpriseCharts ? AgChartsEnterpriseModule : AgChartsCommunityModule),
  ]);
const moduleRegistryCharts = (isEnterpriseCharts: boolean) =>
  j.expressionStatement(
    j.callExpression(
      j.memberExpression(j.identifier('ModuleRegistry'), j.identifier('registerModules')),
      [j.arrayExpression([allEnterpriseWithCharts(isEnterpriseCharts)])],
    ),
  );

function getModuleRegistryCallExpression(
  isEnterpriseCharts: boolean | null,
  usingCharts: UsingCharts,
) {
  return usingCharts === 'none'
    ? moduleRegistry
    : moduleRegistryCharts(usingCharts === 'enterprise' || (isEnterpriseCharts ?? false));
}

export const packageLicenseManager: JSCodeShiftTransformer = (root) => {
  // if using ag-grid-enterprise find the LicenseManager import and add the ModuleRegistry

  const alreadyExists = addNewImportNextToGiven(root, LicenseManager, 'ModuleRegistry');

  if (alreadyExists) {
    // This package file already has a ModuleRegistry import so looks like it has already been transformed
    return root.toSource();
  }

  const usingCharts: UsingCharts = process.env.AG_USING_CHARTS as any;

  addNewImportNextToGiven(root, LicenseManager, AllEnterpriseModule);

  let isEnterpriseCharts: boolean | null = null;
  let lastGridOrSparklinesImportPath: any | null = null;

  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      const source = path?.node?.source?.value?.toString();
      return gridChartsEnterpriseNpmPackage == source || enterpriseNpmPackage == source;
    })
    .forEach((path) => {
      isEnterpriseCharts = gridChartsEnterpriseNpmPackage == path?.node?.source?.value?.toString();
      path.node.source.value = enterpriseNpmPackage;
      lastGridOrSparklinesImportPath = path;
    });

  if (lastGridOrSparklinesImportPath && usingCharts !== 'none') {
    lastGridOrSparklinesImportPath.insertAfter(
      getChartsImport(usingCharts === 'enterprise' || (isEnterpriseCharts ?? false)),
    );
  }
  // add ModuleRegistry.registerModules([AllEnterpriseModule]); before the LicenseManager.setLicenseKey
  root
    .find(j.Identifier, { name: LicenseManager })
    .filter((path) => {
      return !j.ImportSpecifier.check(path.parent.value);
    })
    .forEach((path) => {
      // find the parent CallExpression
      const parentCallExpression = j(path).closest(j.ExpressionStatement);
      parentCallExpression.insertBefore(
        getModuleRegistryCallExpression(isEnterpriseCharts, usingCharts),
      );
    });
};

export const removeEmptyPackageImports: JSCodeShiftTransformer = (root) => {
  // remove empty import statements like
  // import 'ag-grid-enterprise';
  // import 'ag-grid-charts-enterprise';
  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      return (
        [enterpriseNpmPackage, gridChartsEnterpriseNpmPackage].includes(
          path?.node?.source?.value?.toString() ?? '',
        ) && path.node.specifiers?.length === 0
      );
    })
    .remove();
};
