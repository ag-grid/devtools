import j from 'jscodeshift';
import { JSCodeShiftTransformer } from '../jscodeshift.adapter';

export const transformAutoSizeColumnsArguments: JSCodeShiftTransformer = (root) =>
  root
    .find(j.CallExpression, {
      callee: {
        property: {
          name: 'autoSizeColumns',
        },
      },
    })
    .forEach((path) => {
      const args = path.node.arguments;

      if (args.some((a) => j.SpreadElement.check(a))) {
        // can't support spread arguments
        return;
      }

      const [colKeys, skipHeader] = args;

      const properties = [];
      if (!j.SpreadElement.check(colKeys)) {
        properties.push(j.objectProperty(j.identifier('colIds'), colKeys));
      }
      if (skipHeader && !j.SpreadElement.check(skipHeader)) {
        properties.push(j.objectProperty(j.identifier('skipHeader'), skipHeader));
      }

      path.node.arguments = [j.objectExpression(properties)];
    });

export const transformAutoSizeAllColumnsArguments: JSCodeShiftTransformer = (root) =>
  root
    .find(j.CallExpression, {
      callee: {
        property: {
          name: 'autoSizeAllColumns',
        },
      },
    })
    .forEach((path) => {
      const args = path.node.arguments;

      if (args.length === 0) {
        return;
      }

      if (args.some((a) => j.SpreadElement.check(a))) {
        // can't support spread arguments
        return;
      }

      const properties = [];
      if (!j.SpreadElement.check(args[0])) {
        properties.push(j.objectProperty(j.identifier('skipHeaders'), args[0]));
      }

      path.node.arguments = [j.objectExpression(properties)];
    });
