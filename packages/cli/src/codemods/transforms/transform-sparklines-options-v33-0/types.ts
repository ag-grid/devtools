import { ImportSpecifier } from '@babel/types';
import { Collection } from 'jscodeshift';

export type ImportKind = ImportSpecifier['importKind'];

export type ImportSpecifierOption = string | { name: string; type?: ImportKind };

export type JSCodeShiftTransformer = (root: Collection<any>) => void;
