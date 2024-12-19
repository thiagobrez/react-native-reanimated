"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGestureHandlerEventCallback = void 0;
const types_1 = require("@babel/types");
const gestureHandlerGestureObjects = new Set([
    'Tap',
    'Pan',
    'Pinch',
    'Rotation',
    'Fling',
    'LongPress',
    'ForceTouch',
    'Native',
    'Manual',
    'Race',
    'Simultaneous',
    'Exclusive',
    'Hover',
]);
const gestureHandlerBuilderMethods = new Set([
    'onBegin',
    'onStart',
    'onEnd',
    'onFinalize',
    'onUpdate',
    'onChange',
    'onTouchesDown',
    'onTouchesMove',
    'onTouchesUp',
    'onTouchesCancelled',
]);
function isGestureHandlerEventCallback(path) {
    return ((0, types_1.isCallExpression)(path.parent) &&
        (0, types_1.isExpression)(path.parent.callee) &&
        isGestureObjectEventCallbackMethod(path.parent.callee));
}
exports.isGestureHandlerEventCallback = isGestureHandlerEventCallback;
function isGestureObjectEventCallbackMethod(exp) {
    return ((0, types_1.isMemberExpression)(exp) &&
        (0, types_1.isIdentifier)(exp.property) &&
        gestureHandlerBuilderMethods.has(exp.property.name) &&
        containsGestureObject(exp.object));
}
function containsGestureObject(exp) {
    if (isGestureObject(exp)) {
        return true;
    }
    if ((0, types_1.isCallExpression)(exp) &&
        (0, types_1.isMemberExpression)(exp.callee) &&
        containsGestureObject(exp.callee.object)) {
        return true;
    }
    return false;
}
function isGestureObject(exp) {
    return ((0, types_1.isCallExpression)(exp) &&
        (0, types_1.isMemberExpression)(exp.callee) &&
        (0, types_1.isIdentifier)(exp.callee.object) &&
        exp.callee.object.name === 'Gesture' &&
        (0, types_1.isIdentifier)(exp.callee.property) &&
        gestureHandlerGestureObjects.has(exp.callee.property.name));
}
//# sourceMappingURL=gestureHandlerAutoworkletization.js.map