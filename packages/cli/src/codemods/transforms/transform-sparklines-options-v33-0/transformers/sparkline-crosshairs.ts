import j from 'jscodeshift';
import { JSCodeShiftTransformer } from '../types';

export const removeCrosshairs: JSCodeShiftTransformer = (root) =>
  root
    .find(j.ObjectProperty, { key: { name: 'cellRendererParams' } })
    .find(j.ObjectProperty, { key: { name: 'sparklineOptions' } })
    .find(j.ObjectProperty, { key: { name: 'crosshairs' } })
    .forEach((path) => path.replace());
