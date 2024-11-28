import j from 'jscodeshift';
import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';

// convert deprecated ModuleRegistry.register(SingleModule) to ModuleRegistry.registerModules([SingleModule])
export const registerModule: JSCodeShiftTransformer = (root) => {
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
};
