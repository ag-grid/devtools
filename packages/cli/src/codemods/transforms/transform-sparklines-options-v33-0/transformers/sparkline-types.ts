import j from 'jscodeshift';
import { JSCodeShiftTransformer } from '../types';
import { newType, oldTypes } from './constants';

export const replaceTypes: JSCodeShiftTransformer = (root) =>
  root
    .find(j.TSTypeReference)
    .filter((path) => oldTypes.includes((path.value.typeName as any).name))
    .forEach((path) => path.replace(j.tsTypeReference(j.identifier(newType))));
