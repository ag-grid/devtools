import j from 'jscodeshift';

import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import {
  AgChartsEnterpriseModule,
  AllEnterpriseModule,
  enterpriseNpmPackage,
  gridChartsEnterpriseNpmPackage,
} from './constants';
import {
  addNewImportNextToGiven,
  getChartsImport,
  isUsingEnterpriseNpmPackage,
} from './sharedUtils';

const LicenseManager = 'LicenseManager';

const moduleRegistry = j.expressionStatement(
  j.callExpression(
    j.memberExpression(j.identifier('ModuleRegistry'), j.identifier('registerModules')),
    [j.arrayExpression([j.identifier(AllEnterpriseModule)])],
  ),
);

const allEnterpriseWithCharts = j.callExpression(
  j.memberExpression(j.identifier(AllEnterpriseModule), j.identifier('with')),
  [j.identifier(AgChartsEnterpriseModule)],
);
const moduleRegistryCharts = j.expressionStatement(
  j.callExpression(
    j.memberExpression(j.identifier('ModuleRegistry'), j.identifier('registerModules')),
    [j.arrayExpression([allEnterpriseWithCharts])],
  ),
);

export const packageLicenseManager: JSCodeShiftTransformer = (root) => {
  // if using ag-grid-enterprise find the LicenseManager import and add the ModuleRegistry

  const alreadyExists = addNewImportNextToGiven(root, LicenseManager, 'ModuleRegistry');

  if (alreadyExists) {
    // This package file already has a ModuleRegistry import so looks like it has already been transformed
    return root.toSource();
  }

  addNewImportNextToGiven(root, LicenseManager, AllEnterpriseModule);

  let isEnterpriseCharts: boolean | null = null;
  let lastGridOrSparklinesImportPath: any | null = null;

  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      return gridChartsEnterpriseNpmPackage == path?.node?.source?.value;
    })
    .forEach((path) => {
      path.node.source.value = enterpriseNpmPackage;
      isEnterpriseCharts = true;
      lastGridOrSparklinesImportPath = path;
    });

  if (lastGridOrSparklinesImportPath) {
    lastGridOrSparklinesImportPath.insertAfter(getChartsImport(isEnterpriseCharts ?? false));
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
      parentCallExpression.insertBefore(isEnterpriseCharts ? moduleRegistryCharts : moduleRegistry);
    });

  return root.toSource();
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
