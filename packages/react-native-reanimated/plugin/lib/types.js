"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workletClassFactorySuffix = exports.isWorkletizableObjectNode = exports.isWorkletizableObjectPath = exports.isWorkletizableFunctionNode = exports.isWorkletizableFunctionPath = exports.WorkletizableObject = exports.WorkletizableFunction = void 0;
const types_1 = require("@babel/types");
exports.WorkletizableFunction = 'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression|ObjectMethod';
exports.WorkletizableObject = 'ObjectExpression';
function isWorkletizableFunctionPath(path) {
    return (path.isFunctionDeclaration() ||
        path.isFunctionExpression() ||
        path.isArrowFunctionExpression() ||
        path.isObjectMethod());
}
exports.isWorkletizableFunctionPath = isWorkletizableFunctionPath;
function isWorkletizableFunctionNode(node) {
    return ((0, types_1.isFunctionDeclaration)(node) ||
        (0, types_1.isFunctionExpression)(node) ||
        (0, types_1.isArrowFunctionExpression)(node) ||
        (0, types_1.isObjectMethod)(node));
}
exports.isWorkletizableFunctionNode = isWorkletizableFunctionNode;
function isWorkletizableObjectPath(path) {
    return path.isObjectExpression();
}
exports.isWorkletizableObjectPath = isWorkletizableObjectPath;
function isWorkletizableObjectNode(node) {
    return (0, types_1.isObjectExpression)(node);
}
exports.isWorkletizableObjectNode = isWorkletizableObjectNode;
exports.workletClassFactorySuffix = '__classFactory';
//# sourceMappingURL=types.js.map