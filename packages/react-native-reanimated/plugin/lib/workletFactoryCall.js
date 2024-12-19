"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeWorkletFactoryCall = void 0;
const types_1 = require("@babel/types");
const workletFactory_1 = require("./workletFactory");
function makeWorkletFactoryCall(path, state) {
    const workletFactory = (0, workletFactory_1.makeWorkletFactory)(path, state);
    const workletFactoryCall = (0, types_1.callExpression)(workletFactory, []);
    addStackTraceDataToWorkletFactory(path, workletFactoryCall);
    const replacement = workletFactoryCall;
    return replacement;
}
exports.makeWorkletFactoryCall = makeWorkletFactoryCall;
function addStackTraceDataToWorkletFactory(path, workletFactoryCall) {
    const originalWorkletLocation = path.node.loc;
    if (originalWorkletLocation) {
        workletFactoryCall.callee.loc = {
            filename: originalWorkletLocation.filename,
            identifierName: originalWorkletLocation.identifierName,
            start: originalWorkletLocation.start,
            end: originalWorkletLocation.start,
        };
    }
}
//# sourceMappingURL=workletFactoryCall.js.map