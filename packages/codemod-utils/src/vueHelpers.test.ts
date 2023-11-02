import { nonNull } from '@ag-grid-devtools/utils';
import { describe, expect, test } from 'vitest';

import {
  createVueAstNode,
  findVueTemplateNodes,
  matchers as v,
  parseVueComponentTemplateSource,
  printVueTemplate,
  removeVueTemplateNode,
  replaceVueTemplateNode,
  type AST,
} from './vueHelpers';

type VAttribute = AST.VAttribute;
type VIdentifier = AST.VIdentifier;
type VExpressionContainer = AST.VExpressionContainer;
type VElement = AST.VElement;

test(parseVueComponentTemplateSource, () => {
  const input = `<div id="foo"></div>`;
  const template = parseVueComponentTemplateSource(input);
  const root = template && template.node.children[0];
  expect(root && root.type === 'VElement' ? getElementId(root) : null).toBe('foo');
});

describe(findVueTemplateNodes, () => {
  test('locates template nodes', () => {
    const input = `<div><span id="foo"></span><div id="bar"></div><span id="baz"></span></div>`;
    const ast = parseVueComponentTemplateSource(input);
    const actual =
      ast &&
      findVueTemplateNodes(
        ast,
        v.element((element) => element.name === 'span'),
      );
    expect(actual && actual.map(({ node }) => getElementId(node))).toEqual(['foo', 'baz']);
  });

  test('locates event handlers', () => {
    const AG_GRID_EVENT_NAMES = new Set(
      ['onGridReady'].map((value) =>
        value
          .replace(/^on([A-Z])/, (_, initial) => initial.toLowerCase())
          .replace(/([a-zA-Z])([A-Z])/, (_, prev, next) => `${prev}-${next.toLowerCase()}`),
      ),
    );
    const input = `
      <div>
        <ag-grid-vue
          id="grid"
          :columnDefs="columnDefs"
          :rowData="rowData"
          @grid-ready="onGridReady"
        ></ag-grid-vue>
      </div>`;
    const ast = parseVueComponentTemplateSource(input);
    const actual =
      ast &&
      findVueTemplateNodes(
        ast,
        v.element((element) => {
          if (element.name !== 'ag-grid-vue') return false;
          const eventHandlers = element.startTag.attributes
            .map((attribute): [string, VExpressionContainer] | null => {
              if (!attribute.directive) return null;
              if (attribute.key.name.name !== 'on') return null;
              if (!attribute.key.argument || attribute.key.argument.type !== 'VIdentifier') {
                return null;
              }
              if (!attribute.value) return null;
              return [attribute.key.argument.name, attribute.value];
            })
            .filter(nonNull);
          const matchedEventHandlers = eventHandlers.filter(([key, value]) => {
            if (!AG_GRID_EVENT_NAMES.has(key)) return false;
            if (!value.expression || value.expression.type !== 'Identifier') return false;
            return value.expression.name === 'onGridReady';
          });
          return matchedEventHandlers.length > 0;
        }),
      );
    expect(actual && actual.map(({ node }) => getElementId(node))).toEqual(['grid']);
  });
});

describe(printVueTemplate, () => {
  test('no modifications', () => {
    const source = `<div id="foo"></div>`;
    const template = parseVueComponentTemplateSource(source);
    const actual = template && printVueTemplate(template);
    expect(actual).toBe(`<div id="foo"></div>`);
  });

  test('update root node attribute name', () => {
    const source = `<div before="hi" foo="bar" after="bye"></div>`;
    const template = parseVueComponentTemplateSource(source);
    const [attributeNameNode] = findVueTemplateNodes(
      template,
      (node): node is VIdentifier => node.type === 'VIdentifier' && node.name === 'foo',
    );
    const updated = replaceVueTemplateNode(
      attributeNameNode,
      createVueAstNode({
        type: 'VIdentifier',
        name: 'id',
        rawName: 'id',
      }),
    );
    expect(updated.path).toEqual(['children', 0, 'startTag', 'attributes', 1, 'key']);
    const actual = template && printVueTemplate(template);
    expect(actual).toBe(`<div before="hi" id="bar" after="bye"></div>`);
  });

  test('remove root node attribute', () => {
    const source = `<div before="hi" foo="bar" after="bye"></div>`;
    const template = parseVueComponentTemplateSource(source);
    const [attributeNameNode] = findVueTemplateNodes(
      template,
      (node): node is VAttribute =>
        node.type === 'VAttribute' && !node.directive && node.key.name === 'foo',
    );
    removeVueTemplateNode(attributeNameNode);
    const actual = template && printVueTemplate(template);
    expect(actual).toBe(`<div before="hi"  after="bye"></div>`);
  });

  test('update nested node attribute name', () => {
    const source = `
      <ul>
        <li><span></span></li>
        <li><div foo="bar"></li>
        <li><span></span></li>
      </ul>
    `;
    const template = parseVueComponentTemplateSource(source);
    const [attributeNameNode] = findVueTemplateNodes(
      template,
      (node): node is VIdentifier => node.type === 'VIdentifier' && node.name === 'foo',
    );
    const updated = replaceVueTemplateNode(
      attributeNameNode,
      createVueAstNode({
        type: 'VIdentifier',
        name: 'id',
        rawName: 'id',
      }),
    );
    expect(updated.path).toEqual([
      'children',
      1,
      'children',
      3,
      'children',
      0,
      'startTag',
      'attributes',
      0,
      'key',
    ]);
    const actual = template && printVueTemplate(template);
    expect(actual).toBe(`
      <ul>
        <li><span></span></li>
        <li><div id="bar"></li>
        <li><span></span></li>
      </ul>
    `);
  });
});

function getElementId(templateNode: VElement): string | null | undefined {
  return templateNode.startTag.attributes
    .filter((attribute) => attribute.key.name === 'id')
    .map((attribute) =>
      attribute.value && attribute.value.type === 'VLiteral' ? attribute.value.value : null,
    )[0];
}
