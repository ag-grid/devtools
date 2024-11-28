import j, { Collection } from 'jscodeshift';
import { JSCodeShiftTransformer } from '../types';

import {
  AgChartsCommunityModule,
  AgChartsEnterpriseModule,
  AllCommunityModule,
  angularModule,
  angularPackage,
  chartsCommunityPackage,
  chartsEnterprisePackage,
  communityModules,
  communityPackage,
  enterpriseModules,
  enterprisePackage,
  gridChartsEnterpriseModule,
  gridChartsModule,
  GridChartsModule,
  IntegratedChartsModule,
  reactModule,
  reactPackage,
  SparklinesModule,
  sparklinesModule,
  vueModule,
  vuePackage,
} from './constants';

// Find old named imports and replace them with the new named import
export const processImports: JSCodeShiftTransformer = (root) => {
  convertRegisterModuleToRegisterModules(root);

  // find imports from "@ag-grid-community/styles/*"; imports and convert to 'ag-grid-community/styles/*'
  updateAgGridStylesImport(root);

  // If using  GridChartsModule, update to IntegratedChartsModule and import the required charts package
  updateIntegratedCharts(root);

  // Update all old module imports to the new package imports
  convertModuleImportsToPackages(root, communityModules, communityPackage);
  convertModuleImportsToPackages(root, enterpriseModules, enterprisePackage);
  convertModuleImportsToPackages(root, [reactModule], reactPackage);
  convertModuleImportsToPackages(root, [angularModule], angularPackage);
  convertModuleImportsToPackages(root, [vueModule], vuePackage);

  // Import AllCommunityModule and add to ModuleRegistry.registerModules if it doesn't already exists
  addAllCommunityModuleIfMissing(root);

  return root.toSource();
};

// convert ModuleRegistry.register(SingleModule) to ModuleRegistry.registerModules([SingleModule])
function convertRegisterModuleToRegisterModules(root: j.Collection<any>) {
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: 'ModuleRegistry' },
        property: { name: 'register' },
      },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length === 1) {
        path.node.callee.property.name = 'registerModules';
        path.node.arguments = [j.arrayExpression([args[0]])];
      }
    });
}

/** Include the AllCommunityModule to maintain all current working features */
function addAllCommunityModuleIfMissing(root: Collection) {
  // Import AllCommunityModule if it does not already exist next to the ModuleRegistry import
  root
    .find(j.ImportDeclaration)
    .filter(
      (path) =>
        !!path.node.specifiers &&
        path.node.specifiers.some((s: any) => s.imported?.name === 'ModuleRegistry') &&
        !path.node.specifiers.some((s: any) => s.imported?.name === AllCommunityModule),
    )
    .forEach((path) => {
      if (path.node.specifiers) {
        // if sorted then respect the order when adding AllCommunityModule
        if (isSorted(path.node.specifiers.map((s: any) => s.imported.name))) {
          path.node.specifiers.push(j.importSpecifier(j.identifier(AllCommunityModule)));
          path.node.specifiers = sortImports(path.node.specifiers);
        } else {
          path.node.specifiers.unshift(j.importSpecifier(j.identifier(AllCommunityModule)));
        }
      }
    });

  // Find the ModuleRegistry.registerModules() call and include AllCommunityModule if it does not already exist
  getRegisterModulesCall(root).forEach((path) => {
    const args = path.node.arguments;
    if (args.length === 1 && j.ArrayExpression.check(args[0])) {
      if (!args[0].elements.some((e: any) => e.name === AllCommunityModule)) {
        args[0].elements.unshift(j.identifier(AllCommunityModule));
      }
    }
  });
}

function getRegisterModulesCall(root: Collection) {
  return root.find(j.CallExpression, {
    callee: {
      object: { name: 'ModuleRegistry' },
      property: { name: 'registerModules' },
    },
  });
}

function sortImports(imports: any[]) {
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

function isSorted(list: string[]): boolean {
  for (let i = 0; i < list.length - 1; i++) {
    if (list[i] > list[i + 1]) {
      return false;
    }
  }
  return true;
}

function convertModuleImportsToPackages(
  root: Collection,
  oldModules: string[],
  newPackage: string,
) {
  // Find all import declarations that match the oldModules and update them provided
  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      return oldModules.some((m) => path?.node?.source?.value == m);
    })
    .forEach((path) => {
      path.node.source.value = newPackage;
    });
}

function updateIntegratedCharts(root: Collection) {
  let isEnterpriseCharts: boolean | null = null;
  let lastGridOrSparklinesImportPath: any | null = null;

  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      return [gridChartsModule, gridChartsEnterpriseModule, sparklinesModule].some(
        (m) => path?.node?.source?.value == m,
      );
    })
    .forEach((path) => {
      const importPath = path.node.source.value;
      path.node.source.value = enterprisePackage;

      // if GridChartsModule is imported, then rename this to IntegratedChartsModule
      // and add the required charts import

      path.node.specifiers
        ?.filter((s: any) => [GridChartsModule, SparklinesModule].includes(s.imported?.name))
        .map((s: any) => {
          if (s.imported.name === GridChartsModule) {
            // See if the GridChartsModule is from the enterprise charts module
            isEnterpriseCharts = importPath === gridChartsEnterpriseModule;
            s.imported.name = IntegratedChartsModule;
          }
          lastGridOrSparklinesImportPath = path;
        });
    });

  if (lastGridOrSparklinesImportPath) {
    lastGridOrSparklinesImportPath.insertAfter(getChartsImport(isEnterpriseCharts ?? false));
  }

  getRegisterModulesCall(root).forEach((path) => {
    const args = path.node.arguments;
    if (args.length === 1 && j.ArrayExpression.check(args[0])) {
      args[0].elements = args[0].elements.map((e: any) => {
        if (e.name === GridChartsModule) {
          return j.callExpression(
            j.memberExpression(j.identifier(IntegratedChartsModule), j.identifier('with')),
            [
              j.identifier(
                isEnterpriseCharts === true ? AgChartsEnterpriseModule : AgChartsCommunityModule,
              ),
            ],
          );
        }

        if (e.name === SparklinesModule) {
          return j.callExpression(
            j.memberExpression(j.identifier(SparklinesModule), j.identifier('with')),
            [
              j.identifier(
                isEnterpriseCharts === true ? AgChartsEnterpriseModule : AgChartsCommunityModule,
              ),
            ],
          );
        }

        return e;
      });
    }
  });
}

function getChartsImport(isEnterpriseCharts: boolean): any {
  return j.importDeclaration(
    [
      j.importSpecifier(
        j.identifier(isEnterpriseCharts ? AgChartsEnterpriseModule : AgChartsCommunityModule),
      ),
    ],
    j.stringLiteral(isEnterpriseCharts ? chartsEnterprisePackage : chartsCommunityPackage),
  );
}

function updateAgGridStylesImport(root: j.Collection<any>) {
  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      return !!path?.node?.source?.value?.toString()?.startsWith('@ag-grid-community/styles');
    })
    .forEach((path) => {
      path.node.source.value = path.node.source.value
        ?.toString()
        .replace('@ag-grid-community', communityPackage);
    });
}
