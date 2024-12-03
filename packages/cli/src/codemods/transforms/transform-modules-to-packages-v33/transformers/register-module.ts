import j, { Identifier, MemberExpression } from 'jscodeshift';
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
        const callee = path.node.callee as MemberExpression;
        const prop = callee.property as Identifier;
        prop.name = 'registerModules';
        path.node.arguments = [j.arrayExpression([args[0]])];
      }
    });
};
