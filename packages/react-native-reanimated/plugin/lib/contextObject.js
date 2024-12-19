"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isContextObject = exports.processIfWorkletContextObject = exports.contextObjectMarker = void 0;
const types_1 = require("@babel/types");
exports.contextObjectMarker = '__workletContextObject';
function processIfWorkletContextObject(path, _state) {
    if (!isContextObject(path.node)) {
        return false;
    }
    removeContextObjectMarker(path.node);
    processWorkletContextObject(path.node);
    return true;
}
exports.processIfWorkletContextObject = processIfWorkletContextObject;
function isContextObject(objectExpression) {
    return objectExpression.properties.some((property) => (0, types_1.isObjectProperty)(property) &&
        (0, types_1.isIdentifier)(property.key) &&
        property.key.name === exports.contextObjectMarker);
}
exports.isContextObject = isContextObject;
function processWorkletContextObject(objectExpression) {
    const workletObjectFactory = (0, types_1.functionExpression)(null, [], (0, types_1.blockStatement)([(0, types_1.returnStatement)((0, types_1.cloneNode)(objectExpression))], [(0, types_1.directive)((0, types_1.directiveLiteral)('worklet'))]));
    objectExpression.properties.push((0, types_1.objectProperty)((0, types_1.identifier)(`${exports.contextObjectMarker}Factory`), workletObjectFactory));
}
function removeContextObjectMarker(objectExpression) {
    objectExpression.properties = objectExpression.properties.filter((property) => !((0, types_1.isObjectProperty)(property) &&
        (0, types_1.isIdentifier)(property.key) &&
        property.key.name === exports.contextObjectMarker));
}
//# sourceMappingURL=contextObject.js.map