import { ImportSpecifier } from '@babel/types';

export type ImportKind = ImportSpecifier['importKind'];

export type ImportSpecifierOption = string | { name: string; type?: ImportKind };
