import j from 'jscodeshift';
import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';

// match cellRendererParams.sparklineOptions.type === 'column'
// replace with type: 'bar', direction: 'vertical'
export const columnToVerticalBarTransform: JSCodeShiftTransformer = (root) =>
  root
    .find(j.ObjectProperty, { key: { name: 'cellRendererParams' } })
    .find(j.ObjectProperty, { key: { name: 'sparklineOptions' } })
    .find(j.ObjectProperty, { key: { name: 'type' }, value: { value: 'column' } })
    .forEach((path) => {
      path.replace(j.objectProperty(j.identifier('type'), j.stringLiteral('bar')));
      path.insertAfter(j.objectProperty(j.identifier('direction'), j.stringLiteral('vertical')));
    });
