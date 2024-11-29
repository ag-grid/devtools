import j from 'jscodeshift';
import {
  AgChartsCommunityModule,
  AgChartsEnterpriseModule,
  chartsCommunityPackage,
  chartsEnterprisePackage,
} from './constants';

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

export function addNewImportNextToGiven(
  root: j.Collection<any>,
  targetImport: string,
  newImport: string,
) {
  root
    .find(j.ImportDeclaration)
    .filter(
      (path) =>
        !!path.node.specifiers &&
        path.node.specifiers.some((s: any) => s.imported?.name === targetImport) &&
        !path.node.specifiers.some((s: any) => s.imported?.name === newImport),
    )
    .forEach((path) => {
      if (path.node.specifiers) {
        // if sorted then respect the order when adding newImport
        if (isSorted(path.node.specifiers.map((s: any) => s.imported.name))) {
          path.node.specifiers.push(j.importSpecifier(j.identifier(newImport)));
          path.node.specifiers = sortImports(path.node.specifiers);
        } else {
          path.node.specifiers.unshift(j.importSpecifier(j.identifier(newImport)));
        }
      }
    });
}
export function addNewIdentifierNextToGiven(
  root: j.Collection<any>,
  targetName: string,
  newName: string,
) {
  root
    .find(j.Identifier, { name: targetName })
    .filter((path) => {
      return (
        !j.ImportSpecifier.check(path.parent.value) &&
        j.ArrayExpression.check(path.parent.value) &&
        !path.parent.value.elements.some((e: any) => e.name === newName)
      );
    })
    .forEach((path) => {
      const areSorted = isSorted(path.parent.value.elements.map((e: any) => e.name));
      if (areSorted) {
        path.parent.value.elements.push(j.identifier(newName));
        path.parent.value.elements = sortIdentifiers(path.parent.value.elements);
      } else {
        path.insertAfter(j.identifier(newName));
      }
    });
}

export function getChartsImport(isEnterpriseCharts: boolean): any {
  return j.importDeclaration(
    [
      j.importSpecifier(
        j.identifier(isEnterpriseCharts ? AgChartsEnterpriseModule : AgChartsCommunityModule),
      ),
    ],
    j.stringLiteral(isEnterpriseCharts ? chartsEnterprisePackage : chartsCommunityPackage),
  );
}
