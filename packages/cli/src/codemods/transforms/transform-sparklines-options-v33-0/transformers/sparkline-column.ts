import j from 'jscodeshift';
import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';

// update bar/column types to bar with matching direction
export const columnToVerticalBarTransform: JSCodeShiftTransformer = (root) =>
  root
    .find(j.ObjectProperty, { key: { name: 'cellRendererParams' } })
    .find(j.ObjectProperty, { key: { name: 'sparklineOptions' } })
    .find(j.ObjectProperty, { key: { name: 'type' } })
    .filter((path) => ['bar', 'column'].includes((path.value.value as any).value))
    .forEach((path) => {
      const existingType = (path.value.value as any).value;
      const direction = existingType === 'column' ? 'vertical' : 'horizontal';
      path.replace(j.objectProperty(j.identifier('type'), j.stringLiteral('bar')));
      path.insertAfter(j.objectProperty(j.identifier('direction'), j.stringLiteral(direction)));
    });
