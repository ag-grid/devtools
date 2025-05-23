import j, { Collection } from 'jscodeshift';

import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import {
  AgChartsCommunityModule,
  AgChartsEnterpriseModule,
  enterpriseNpmPackage,
  gridChartsEnterpriseNpmModule,
  gridChartsNpmModule,
  GridChartsModule,
  IntegratedChartsModule,
  SparklinesModule,
  sparklinesNpmModule,
} from './constants';
import { getChartsImport } from './sharedUtils';

export const chartImports: JSCodeShiftTransformer = (root) => {
  // If using  GridChartsModule, update to IntegratedChartsModule and import the required charts package
  let isEnterpriseCharts: boolean | null = null;
  let lastGridOrSparklinesImportPath: any | null = null;

  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      return [gridChartsNpmModule, gridChartsEnterpriseNpmModule, sparklinesNpmModule].some(
        (m) => path?.node?.source?.value == m,
      );
    })
    .forEach((path) => {
      const importPath = path.node.source.value;
      path.node.source.value = enterpriseNpmPackage;

      // if GridChartsModule is imported, then rename this to IntegratedChartsModule
      // and add the required charts import

      path.node.specifiers
        ?.filter((s: any) => [GridChartsModule, SparklinesModule].includes(s.imported?.name))
        .map((s: any) => {
          if (s.imported.name === GridChartsModule) {
            // See if the GridChartsModule is from the enterprise charts module
            isEnterpriseCharts = importPath === gridChartsEnterpriseNpmModule;
            s.imported.name = IntegratedChartsModule;
          }
          lastGridOrSparklinesImportPath = path;
        });
    });

  if (lastGridOrSparklinesImportPath) {
    lastGridOrSparklinesImportPath.insertAfter(getChartsImport(isEnterpriseCharts ?? false));
  }

  swapGridChartsModuleForIntegratedChartsModule(root, isEnterpriseCharts ?? false);
  addChartsModuleToSparklinesModule(root, isEnterpriseCharts ?? false);
};

// Wherever GridChartsModule is used outside of an import statement, replace it with IntegratedChartsModule.with(AgChartsModule)
function swapGridChartsModuleForIntegratedChartsModule(
  root: Collection,
  isEnterpriseCharts: boolean,
) {
  root
    .find(j.Identifier, { name: GridChartsModule })
    // filter out imports
    .filter((path) => {
      return !j.ImportSpecifier.check(path.parent.value);
    })
    .forEach((path) => {
      // replace GridChartsModule with IntegratedChartsModule.with(AgChartsModule)
      path.replace(
        j.callExpression(
          j.memberExpression(j.identifier(IntegratedChartsModule), j.identifier('with')),
          [
            j.identifier(
              isEnterpriseCharts === true ? AgChartsEnterpriseModule : AgChartsCommunityModule,
            ),
          ],
        ),
      );
    });
}
function addChartsModuleToSparklinesModule(root: Collection, isEnterpriseCharts: boolean) {
  root
    .find(j.Identifier, { name: SparklinesModule })
    // filter out imports
    .filter((path) => {
      return !j.ImportSpecifier.check(path.parent.value);
    })
    .forEach((path) => {
      // replace SparklinesModule with SparklinesModule.with(AgChartsModule)
      path.replace(
        j.callExpression(j.memberExpression(j.identifier(SparklinesModule), j.identifier('with')), [
          j.identifier(
            isEnterpriseCharts === true ? AgChartsEnterpriseModule : AgChartsCommunityModule,
          ),
        ]),
      );
    });
}
