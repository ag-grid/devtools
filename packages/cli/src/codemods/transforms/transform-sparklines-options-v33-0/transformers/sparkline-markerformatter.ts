import j from 'jscodeshift';
import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';

// rename marker.formatter to marker.itemStyler
export const markerFormatter: JSCodeShiftTransformer = (root) => {
  const markerOptions = root
    .find(j.ObjectProperty, { key: { name: 'cellRendererParams' } })
    .find(j.ObjectProperty, { key: { name: 'sparklineOptions' } })
    .find(j.ObjectProperty, { key: { name: 'marker' } });

  // rename all marker formatter keys to itemStyler
  markerOptions.forEach((path) => {
    const marker = j(path);
    const markerFormatter = marker.find(j.ObjectProperty, { key: { name: 'formatter' } });

    if (markerFormatter.length === 0) {
      return;
    }

    markerFormatter.forEach((path) => {
      (path.value.key as any).name = 'itemStyler';
    });
  });
};
