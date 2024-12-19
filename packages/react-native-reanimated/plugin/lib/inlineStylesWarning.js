"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processInlineStylesWarning = void 0;
const types_1 = require("@babel/types");
const utils_1 = require("./utils");
const assert_1 = require("assert");
function generateInlineStylesWarning(path) {
    return (0, types_1.callExpression)((0, types_1.arrowFunctionExpression)([], (0, types_1.blockStatement)([
        (0, types_1.expressionStatement)((0, types_1.callExpression)((0, types_1.memberExpression)((0, types_1.identifier)('console'), (0, types_1.identifier)('warn')), [
            (0, types_1.callExpression)((0, types_1.memberExpression)((0, types_1.callExpression)((0, types_1.identifier)('require'), [
                (0, types_1.stringLiteral)('react-native-reanimated'),
            ]), (0, types_1.identifier)('getUseOfValueInStyleWarning')), []),
        ])),
        (0, types_1.returnStatement)(path.node),
    ])), []);
}
function processPropertyValueForInlineStylesWarning(path) {
    if (path.isMemberExpression() && (0, types_1.isIdentifier)(path.node.property)) {
        if (path.node.property.name === 'value') {
            path.replaceWith(generateInlineStylesWarning(path));
        }
    }
}
function processTransformPropertyForInlineStylesWarning(path) {
    if ((0, types_1.isArrayExpression)(path.node)) {
        const elements = path.get('elements');
        (0, assert_1.strict)(Array.isArray(elements), '[Reanimated] `elements` should be an array.');
        for (const element of elements) {
            if (element.isObjectExpression()) {
                processStyleObjectForInlineStylesWarning(element);
            }
        }
    }
}
function processStyleObjectForInlineStylesWarning(path) {
    const properties = path.get('properties');
    for (const property of properties) {
        if (property.isObjectProperty()) {
            const value = property.get('value');
            if ((0, types_1.isIdentifier)(property.node.key) &&
                property.node.key.name === 'transform') {
                processTransformPropertyForInlineStylesWarning(value);
            }
            else {
                processPropertyValueForInlineStylesWarning(value);
            }
        }
    }
}
function processInlineStylesWarning(path, state) {
    if ((0, utils_1.isRelease)()) {
        return;
    }
    if (state.opts.disableInlineStylesWarning) {
        return;
    }
    if (path.node.name.name !== 'style') {
        return;
    }
    if (!(0, types_1.isJSXExpressionContainer)(path.node.value)) {
        return;
    }
    const expression = path.get('value').get('expression');
    (0, assert_1.strict)(!Array.isArray(expression), '[Reanimated] `expression` should not be an array.');
    if (expression.isArrayExpression()) {
        const elements = expression.get('elements');
        (0, assert_1.strict)(Array.isArray(elements), '[Reanimated] `elements` should be an array.');
        for (const element of elements) {
            if (element.isObjectExpression()) {
                processStyleObjectForInlineStylesWarning(element);
            }
        }
    }
    else if (expression.isObjectExpression()) {
        processStyleObjectForInlineStylesWarning(expression);
    }
}
exports.processInlineStylesWarning = processInlineStylesWarning;
//# sourceMappingURL=inlineStylesWarning.js.map