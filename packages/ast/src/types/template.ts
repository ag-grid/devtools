import type { Expression, Statement } from '@babel/types';

import type { AstNode } from './ast';

export interface Template<V extends TemplateVariables<V>, T extends TemplateType> {
  render(variables: V): T;
}

export type TemplateVariables<P> = { [K in keyof P]: AstNode };

export type TemplateType = Expression | Statement | Array<Statement>;
