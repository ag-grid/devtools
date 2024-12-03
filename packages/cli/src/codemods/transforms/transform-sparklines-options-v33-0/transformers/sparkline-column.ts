import j from 'jscodeshift';
import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';

// update bar/column types to bar with matching direction
export const columnToVerticalBarTransform: JSCodeShiftTransformer = (root, state) =>
  root
    .find(j.ObjectProperty, { key: { name: 'cellRendererParams' } })
    .find(j.ObjectProperty, { key: { name: 'sparklineOptions' } })
    .find(j.ObjectProperty, { key: { name: 'type' } })
    .forEach((path) => {
      const typeValue = path.value.value;
      const isStringLiteral = j.StringLiteral.check(typeValue);
      if (isStringLiteral && ['bar', 'column'].includes(typeValue.value)) {
        const existingType = typeValue.value;
        const direction = existingType === 'column' ? 'vertical' : 'horizontal';
        path.replace(j.objectProperty(j.identifier('type'), j.stringLiteral('bar')));
        path.insertAfter(j.objectProperty(j.identifier('direction'), j.stringLiteral(direction)));
      } else if (!isStringLiteral) {
        state?.opts.warn(
          null,
          new SyntaxError(
            `The grid cellRendererParams sparklineOption "type" cannot be automatically migrated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-33-0/`,
          ),
          { forceOutput: true },
        );
      }
    });
