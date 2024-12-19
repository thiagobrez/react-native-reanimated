"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.substituteObjectMethodWithObjectProperty = exports.processWorklet = exports.processIfWithWorkletDirective = void 0;
const types_1 = require("@babel/types");
const types_2 = require("./types");
const utils_1 = require("./utils");
const workletFactoryCall_1 = require("./workletFactoryCall");
function processIfWithWorkletDirective(path, state) {
    if (!(0, types_1.isBlockStatement)(path.node.body)) {
        return false;
    }
    if (!hasWorkletDirective(path.node.body.directives)) {
        return false;
    }
    processWorklet(path, state);
    return true;
}
exports.processIfWithWorkletDirective = processIfWithWorkletDirective;
function processWorklet(path, state) {
    if (state.opts.processNestedWorklets) {
        path.traverse({
            [types_2.WorkletizableFunction](subPath, passedState) {
                processIfWithWorkletDirective(subPath, passedState);
            },
        }, state);
    }
    const workletFactoryCall = (0, workletFactoryCall_1.makeWorkletFactoryCall)(path, state);
    substituteWorkletWithWorkletFactoryCall(path, workletFactoryCall);
}
exports.processWorklet = processWorklet;
function hasWorkletDirective(directives) {
    return directives.some((directive) => (0, types_1.isDirectiveLiteral)(directive.value) && directive.value.value === 'worklet');
}
function substituteWorkletWithWorkletFactoryCall(path, workletFactoryCall) {
    var _a;
    if (path.isObjectMethod()) {
        substituteObjectMethodWithObjectProperty(path, workletFactoryCall);
    }
    else {
        const name = 'id' in path.node ? (_a = path.node.id) === null || _a === void 0 ? void 0 : _a.name : undefined;
        (0, utils_1.replaceWithFactoryCall)(path, name, workletFactoryCall);
    }
}
function substituteObjectMethodWithObjectProperty(path, workletFactoryCall) {
    const replacement = (0, types_1.objectProperty)(path.node.key, workletFactoryCall);
    path.replaceWith(replacement);
}
exports.substituteObjectMethodWithObjectProperty = substituteObjectMethodWithObjectProperty;
//# sourceMappingURL=workletSubstitution.js.map