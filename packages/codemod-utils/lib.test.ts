import { expect, test } from 'vitest';

import * as lib from './lib';

test('module exports', () => {
  expect({ ...lib }).toEqual({
    AG_GRID_JS_PACKAGE_NAME_PATTERN: lib.AG_GRID_JS_PACKAGE_NAME_PATTERN,
    AG_GRID_JS_UMD_GLOBAL_NAME: lib.AG_GRID_JS_UMD_GLOBAL_NAME,
    Angular: lib.Angular,
    AngularComponentTemplateDefinition: lib.AngularComponentTemplateDefinition,
    AngularGridApiBinding: lib.AngularGridApiBinding,
    AngularTemplateEngine: lib.AngularTemplateEngine,
    AngularTemplateFormatter: lib.AngularTemplateFormatter,
    BindingType: lib.BindingType,
    GridApiDefinition: lib.GridApiDefinition,
    SecurityContext: lib.SecurityContext,
    TSESTree: lib.TSESTree,
    VueTemplateEngine: lib.VueTemplateEngine,
    VueTemplateFormatter: lib.VueTemplateFormatter,
    createAngularBooleanLiteral: lib.createAngularBooleanLiteral,
    createCodemodTask: lib.createCodemodTask,
    createVueAstNode: lib.createVueAstNode,
    createVueBooleanLiteral: lib.createVueBooleanLiteral,
    createVueExpressionContainer: lib.createVueExpressionContainer,
    findNamedAngularTemplateElements: lib.findNamedAngularTemplateElements,
    findTemplateNodes: lib.findTemplateNodes,
    getAngularColumnApiReferences: lib.getAngularColumnApiReferences,
    getAngularComponentDataFieldReferences: lib.getAngularComponentDataFieldReferences,
    getAngularComponentDecoratorOptions: lib.getAngularComponentDecoratorOptions,
    getAngularComponentExternalTemplatePath: lib.getAngularComponentExternalTemplatePath,
    getAngularComponentMetadata: lib.getAngularComponentMetadata,
    getAngularComponentPropertyReadExpression: lib.getAngularComponentPropertyReadExpression,
    getAngularExpressionRoot: lib.getAngularExpressionRoot,
    getAngularGridApiReferences: lib.getAngularGridApiReferences,
    getAngularTemplateNodeChild: lib.getAngularTemplateNodeChild,
    getAngularTemplateRootElements: lib.getAngularTemplateRootElements,
    getAngularViewChildMetadata: lib.getAngularViewChildMetadata,
    getColumnApiReferences: lib.getColumnApiReferences,
    getFrameworkEventNames: lib.getFrameworkEventNames,
    getGridApiReferences: lib.getGridApiReferences,
    getJsGridApiReferences: lib.getJsGridApiReferences,
    getReactColumnApiReferences: lib.getReactColumnApiReferences,
    getReactGridApiReferences: lib.getReactGridApiReferences,
    getTemplateNodeChild: lib.getTemplateNodeChild,
    getVueColumnApiReferences: lib.getVueColumnApiReferences,
    getVueComponentComponentDeclarations: lib.getVueComponentComponentDeclarations,
    getVueComponentDataFieldReferences: lib.getVueComponentDataFieldReferences,
    getVueComponentTemplateProperty: lib.getVueComponentTemplateProperty,
    getVueComponentTemplateSource: lib.getVueComponentTemplateSource,
    getVueElementDirectives: lib.getVueElementDirectives,
    getVueElementEventHandlerDirectiveName: lib.getVueElementEventHandlerDirectiveName,
    getVueElementEventHandlerDirectives: lib.getVueElementEventHandlerDirectives,
    getVueExpressionContainerExpression: lib.getVueExpressionContainerExpression,
    getVueGridApiReferences: lib.getVueGridApiReferences,
    getVueTemplateNodeChild: lib.getVueTemplateNodeChild,
    invertAngularBooleanExpression: lib.invertAngularBooleanExpression,
    invertVueBooleanExpression: lib.invertVueBooleanExpression,
    isAngularAstRootNode: lib.isAngularAstRootNode,
    isColumnApiReference: lib.isColumnApiReference,
    isGridApiReference: lib.isGridApiReference,
    isNamedAngularComponentMethodCallExpression: lib.isNamedAngularComponentMethodCallExpression,
    isPropertyAccessorNode: lib.isPropertyAccessorNode,
    isPropertyAssignmentNode: lib.isPropertyAssignmentNode,
    isPropertyInitializerNode: lib.isPropertyInitializerNode,
    isTypedAngularAstNode: lib.isTypedAngularAstNode,
    isTypedAngularExpressionNode: lib.isTypedAngularExpressionNode,
    isTypedAngularTemplateNode: lib.isTypedAngularTemplateNode,
    isTypedVueTemplateNode: lib.isTypedVueTemplateNode,
    isVueAttributeAttribute: lib.isVueAttributeAttribute,
    isVueDirectiveAttribute: lib.isVueDirectiveAttribute,
    isVueESLintBigIntLiteral: lib.isVueESLintBigIntLiteral,
    isVueESLintBooleanLiteral: lib.isVueESLintBooleanLiteral,
    isVueESLintNullLiteral: lib.isVueESLintNullLiteral,
    isVueESLintNumberLiteral: lib.isVueESLintNumberLiteral,
    isVueESLintRegExpLiteral: lib.isVueESLintRegExpLiteral,
    isVueESLintStringLiteral: lib.isVueESLintStringLiteral,
    matchVueComponentMethod: lib.matchVueComponentMethod,
    matchers: lib.matchers,
    mergeSourceChunks: lib.mergeSourceChunks,
    parseAngularComponentTemplate: lib.parseAngularComponentTemplate,
    parseVueComponentTemplateSource: lib.parseVueComponentTemplateSource,
    parseVueSfcComponent: lib.parseVueSfcComponent,
    printTemplate: lib.printTemplate,
    removeTemplateNode: lib.removeTemplateNode,
    replaceTemplateNode: lib.replaceTemplateNode,
    transformFile: lib.transformFile,
    updateAngularComponentTemplate: lib.updateAngularComponentTemplate,
    visitGridOptionsProperties: lib.visitGridOptionsProperties,
  });
});
