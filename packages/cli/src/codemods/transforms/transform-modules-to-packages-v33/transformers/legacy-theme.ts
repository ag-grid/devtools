import j from 'jscodeshift';

import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import {
  AgChartsCommunityModule,
  AgChartsEnterpriseModule,
  AllEnterpriseModule,
  enterpriseNpmPackage,
  gridChartsEnterpriseNpmPackage,
} from './constants';
import { addNewImportNextToGiven, getChartsImport, globalLegacyTheme } from './sharedUtils';
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

export const legacyGlobalTheme: JSCodeShiftTransformer = (root) => {
  // if using ag-grid-enterprise find the LicenseManager import and add the provideGlobalGridOptions

  const usingThemeBuilder: boolean = process.env.AG_USING_THEME_BUILDER === 'true';

  if (usingThemeBuilder) {
    return;
  }

  addNewImportNextToGiven(root, LicenseManager, 'provideGlobalGridOptions');

  // TODO what if there is an existing global grid options!!!!!
  root
    .find(j.Identifier, { name: LicenseManager })
    .filter((path) => {
      return !j.ImportSpecifier.check(path.parent.value);
    })
    .forEach((path) => {
      // find the parent CallExpression
      const parentCallExpression = j(path).closest(j.ExpressionStatement);
      parentCallExpression.insertBefore(globalLegacyTheme());
    });
};
