import j from 'jscodeshift';
import { ErrorSpec, JSCodeShiftTransformer } from '../../../plugins/jscodeshift';

export const transformAutoSizeColumnsArguments: JSCodeShiftTransformer = (root) => {
  const errors: ErrorSpec[] = [];
  const warnings: ErrorSpec[] = [];

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
        errors.push({ path, message: 'Cannot support spread arguments' });
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

  return { errors, warnings };
};

export const transformAutoSizeAllColumnsArguments: JSCodeShiftTransformer = (root) => {
  const errors: ErrorSpec[] = [];
  const warnings: ErrorSpec[] = [];

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
        errors.push({ path, message: 'Cannot support spread arguments' });
        return;
      }

      const properties = [];
      if (!j.SpreadElement.check(args[0])) {
        properties.push(j.objectProperty(j.identifier('skipHeaders'), args[0]));
      }

      path.node.arguments = [j.objectExpression(properties)];
    });

  return { errors, warnings };
};
