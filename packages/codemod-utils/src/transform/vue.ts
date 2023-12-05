import {
  type AstCliContext,
  type AstTransform,
  type AstTransformResult,
  type AstTransformWithOptions,
} from '@ag-grid-devtools/ast';

import { type AstTransformJsOptions, type AstTransformOptions } from '../types';
import {
  parseVueSfcComponent,
  VueTemplateEngine,
  VueTemplateFormatter,
  type AST,
  type VueTemplateNode,
} from '../vueHelpers';
import { transformJsFile } from './js';
import { printTemplate } from '../templateHelpers';

type VElement = AST.VElement;

export interface VueComponentCliContext {
  vue?: {
    template: VueTemplateNode<VElement> | undefined;
  };
}

export function transformVueSfcFile(
  source: string,
  transforms: Array<
    | AstTransform<AstCliContext & VueComponentCliContext>
    | AstTransformWithOptions<AstCliContext & VueComponentCliContext>
  >,
  options: AstTransformOptions & AstTransformJsOptions,
): AstTransformResult {
  // Extract the different sections of the SFC
  const component = parseVueSfcComponent(source);
  const {
    range: [scriptStart, scriptEnd],
    templateBody: templateRoot,
  } = component;
  // Wrap the template root in a transformable node wrapper
  const template: VueTemplateNode<VElement> | undefined = templateRoot && {
    node: templateRoot,
    path: [],
    template: {
      engine: new VueTemplateEngine(),
      source,
      root: {
        element: templateRoot,
        omitRootTag: false,
      },
      mutations: [],
    },
  };
  // Expose the template to the transforms via plugin context
  const vueTransformOptions: VueComponentCliContext = {
    vue: {
      template,
    },
  };
  // Transform the <script> section of the SFC
  const scriptSource = source.slice(scriptStart, scriptEnd);
  const { source: updatedScriptSource, errors } = transformJsFile(
    scriptSource,
    transforms.map((transform): AstTransformWithOptions<AstCliContext & VueComponentCliContext> => {
      const [plugin, options] = Array.isArray(transform) ? transform : [transform, {}];
      return [plugin, { ...options, ...vueTransformOptions }];
    }),
    {
      ...options,
      sourceType: 'module',
      jsx: false,
    },
  );
  // Determine whether the template has been updated within the transform
  const updatedTemplate = vueTransformOptions.vue && vueTransformOptions.vue.template;
  const updatedTemplateSource =
    updatedTemplate !== template ||
    (updatedTemplate && updatedTemplate.template.mutations.length > 0)
      ? updatedTemplate
        ? printTemplate(updatedTemplate, new VueTemplateFormatter())
        : ''
      : null;
  // If there were no changes, bail out
  if (updatedScriptSource === null && updatedTemplateSource === null) {
    return { source: null, errors };
  }
  // Otherwise splice the chunks of the template back together in the original
  const [templateStart, templateEnd] = templateRoot ? templateRoot.range : [scriptEnd, scriptEnd];
  const templateChunk = {
    start: templateStart,
    end: templateEnd,
    replacement:
      updatedTemplateSource !== null
        ? updatedTemplateSource
        : source.slice(templateStart, templateEnd),
  };
  const scriptChunk = {
    start: scriptStart,
    end: scriptEnd,
    replacement:
      updatedScriptSource !== null ? updatedScriptSource : source.slice(scriptStart, scriptEnd),
  };
  const [firstChunk, secondChunk] =
    templateStart < scriptStart ? [templateChunk, scriptChunk] : [scriptChunk, templateChunk];
  return {
    source: `${source.slice(0, firstChunk.start)}${firstChunk.replacement}${source.slice(
      firstChunk.end,
      secondChunk.start,
    )}${secondChunk.replacement}${source.slice(secondChunk.end)}`,
    errors,
  };
}
