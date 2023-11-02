import { type TemplateType, type Template, type TemplateVariables } from './types';

export function template<V extends TemplateVariables<V>, T extends TemplateType>(
  template: (variables: V) => T,
): Template<V, T> {
  return {
    render: template,
  };
}
