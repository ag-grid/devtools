import j from 'jscodeshift';
import { JSCodeShiftTransformer } from '../types';

const chartTypeKeys = ['area', 'bar', 'column', 'line'];

// find [chart-type] keys, and merge their contents into the parent object
export const highlightStyle: JSCodeShiftTransformer = (root) => {
  const sparklineOptions = root
    .find(j.ObjectProperty, { key: { name: 'cellRendererParams' } })
    .find(j.ObjectProperty, { key: { name: 'sparklineOptions' } });

  return sparklineOptions.forEach((path) => {
    const sparklineOption = j(path);
    const highlightStyle = sparklineOption.find(j.ObjectProperty, {
      key: { name: 'highlightStyle' },
    });

    if (highlightStyle.length === 0) {
      return;
    }

    // create itemStyler function, return highlightStyle if highlighted
    const itemStyler = j.property(
      'init',
      j.identifier('itemStyler'),
      j.functionExpression(
        null,
        [j.identifier('params')],
        j.blockStatement([
          j.ifStatement(
            j.memberExpression(j.identifier('params'), j.identifier('highlighted')),
            j.blockStatement([j.returnStatement(highlightStyle.get(0).node.value)]),
          ),
        ]),
      ),
    );

    let marker = sparklineOption.find(j.ObjectProperty, { key: { name: 'marker' } });

    if (marker.length === 0) {
      // create new marker object
      marker = highlightStyle.insertAfter(
        j.property('init', j.identifier('marker'), j.objectExpression([itemStyler])),
      );
    } else {
      // add itemStyler to existing marker object
      marker.get(0).node.value.properties.push(itemStyler);
    }

    highlightStyle.forEach((path) => path.replace());
  });
};
