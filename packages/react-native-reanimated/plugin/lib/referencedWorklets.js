"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findReferencedWorklet = void 0;
const types_1 = require("./types");
function findReferencedWorklet(workletIdentifier, acceptWorkletizableFunction, acceptObject) {
    const workletName = workletIdentifier.node.name;
    const scope = workletIdentifier.scope;
    const workletBinding = scope.getBinding(workletName);
    if (!workletBinding) {
        return undefined;
    }
    if (acceptWorkletizableFunction &&
        workletBinding.path.isFunctionDeclaration()) {
        return workletBinding.path;
    }
    const isConstant = workletBinding.constant;
    if (isConstant) {
        return findReferencedWorkletFromVariableDeclarator(workletBinding, acceptWorkletizableFunction, acceptObject);
    }
    return findReferencedWorkletFromAssignmentExpression(workletBinding, acceptWorkletizableFunction, acceptObject);
}
exports.findReferencedWorklet = findReferencedWorklet;
function findReferencedWorkletFromVariableDeclarator(workletBinding, acceptWorkletizableFunction, acceptObject) {
    const workletDeclaration = workletBinding.path;
    if (!workletDeclaration.isVariableDeclarator()) {
        return undefined;
    }
    const worklet = workletDeclaration.get('init');
    if (acceptWorkletizableFunction && (0, types_1.isWorkletizableFunctionPath)(worklet)) {
        return worklet;
    }
    if (acceptObject && (0, types_1.isWorkletizableObjectPath)(worklet)) {
        return worklet;
    }
    return undefined;
}
function findReferencedWorkletFromAssignmentExpression(workletBinding, acceptWorkletizableFunction, acceptObject) {
    const workletDeclaration = workletBinding.constantViolations
        .reverse()
        .find((constantViolation) => constantViolation.isAssignmentExpression() &&
        ((acceptWorkletizableFunction &&
            (0, types_1.isWorkletizableFunctionPath)(constantViolation.get('right'))) ||
            (acceptObject &&
                (0, types_1.isWorkletizableObjectPath)(constantViolation.get('right')))));
    if (!workletDeclaration || !workletDeclaration.isAssignmentExpression()) {
        return undefined;
    }
    const workletDefinition = workletDeclaration.get('right');
    if (acceptWorkletizableFunction &&
        (0, types_1.isWorkletizableFunctionPath)(workletDefinition)) {
        return workletDefinition;
    }
    if (acceptObject && (0, types_1.isWorkletizableObjectPath)(workletDefinition)) {
        return workletDefinition;
    }
    return undefined;
}
//# sourceMappingURL=referencedWorklets.js.map