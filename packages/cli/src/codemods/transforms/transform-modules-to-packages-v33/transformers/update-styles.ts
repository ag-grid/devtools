import j from 'jscodeshift';

import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import { communityPackage } from './constants';

// find imports from "@ag-grid-community/styles/*"; imports and convert to 'ag-grid-community/styles/*'
export const updateStyles: JSCodeShiftTransformer = (root) => {
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

  return root.toSource();
};
