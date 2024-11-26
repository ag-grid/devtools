import j from 'jscodeshift';
import { JSCodeShiftTransformer } from '../types';

const chartTypeKeys = ['area', 'bar', 'column', 'line'];

// find [chart-type] keys, and merge their contents into the parent object
export const chartTypeSubobject: JSCodeShiftTransformer = (root) =>
  root
    .find(j.ObjectProperty, { key: { name: 'cellRendererParams' } })
    .find(j.ObjectProperty, { key: { name: 'sparklineOptions' } })
    .find(j.ObjectProperty)
    .filter((path) => chartTypeKeys.includes((path.value.key as any).name))
    .forEach((path) => {
      const childProperties = (path.value.value as any).properties;
      childProperties.forEach((childPath: any) => {
        path.parent.value.properties.push(childPath);
      });
      path.replace();
    });
