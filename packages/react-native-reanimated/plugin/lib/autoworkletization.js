"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCalleesAutoworkletizableCallbacks = exports.processIfAutoworkletizableCallback = void 0;
const types_1 = require("@babel/types");
const types_2 = require("./types");
const workletSubstitution_1 = require("./workletSubstitution");
const gestureHandlerAutoworkletization_1 = require("./gestureHandlerAutoworkletization");
const layoutAnimationAutoworkletization_1 = require("./layoutAnimationAutoworkletization");
const referencedWorklets_1 = require("./referencedWorklets");
const objectWorklets_1 = require("./objectWorklets");
const objectHooks = new Set([
    'useAnimatedGestureHandler',
    'useAnimatedScrollHandler',
]);
const functionHooks = new Set([
    'useFrameCallback',
    'useAnimatedStyle',
    'useAnimatedProps',
    'createAnimatedPropAdapter',
    'useDerivedValue',
    'useAnimatedScrollHandler',
    'useAnimatedReaction',
    'useWorkletCallback',
    'withTiming',
    'withSpring',
    'withDecay',
    'withRepeat',
    'runOnUI',
    'executeOnUIRuntimeSync',
]);
const functionArgsToWorkletize = new Map([
    ['useAnimatedGestureHandler', [0]],
    ['useFrameCallback', [0]],
    ['useAnimatedStyle', [0]],
    ['useAnimatedProps', [0]],
    ['createAnimatedPropAdapter', [0]],
    ['useDerivedValue', [0]],
    ['useAnimatedScrollHandler', [0]],
    ['useAnimatedReaction', [0, 1]],
    ['useWorkletCallback', [0]],
    ['withTiming', [2]],
    ['withSpring', [2]],
    ['withDecay', [1]],
    ['withRepeat', [3]],
    ['runOnUI', [0]],
    ['executeOnUIRuntimeSync', [0]],
]);
function processIfAutoworkletizableCallback(path, state) {
    if ((0, gestureHandlerAutoworkletization_1.isGestureHandlerEventCallback)(path) || (0, layoutAnimationAutoworkletization_1.isLayoutAnimationCallback)(path)) {
        (0, workletSubstitution_1.processWorklet)(path, state);
        return true;
    }
    return false;
}
exports.processIfAutoworkletizableCallback = processIfAutoworkletizableCallback;
function processCalleesAutoworkletizableCallbacks(path, state) {
    const callee = (0, types_1.isSequenceExpression)(path.node.callee)
        ? path.node.callee.expressions[path.node.callee.expressions.length - 1]
        : path.node.callee;
    const name = 'name' in callee
        ? callee.name
        : 'property' in callee && 'name' in callee.property
            ? callee.property.name
            : undefined;
    if (name === undefined) {
        return;
    }
    if (functionHooks.has(name) || objectHooks.has(name)) {
        const acceptWorkletizableFunction = functionHooks.has(name);
        const acceptObject = objectHooks.has(name);
        const argIndices = functionArgsToWorkletize.get(name);
        const args = path
            .get('arguments')
            .filter((_, index) => argIndices.includes(index));
        processArgs(args, state, acceptWorkletizableFunction, acceptObject);
    }
}
exports.processCalleesAutoworkletizableCallbacks = processCalleesAutoworkletizableCallbacks;
function processArgs(args, state, acceptWorkletizableFunction, acceptObject) {
    args.forEach((arg) => {
        const maybeWorklet = findWorklet(arg, acceptWorkletizableFunction, acceptObject);
        if (!maybeWorklet) {
            return;
        }
        if ((0, types_2.isWorkletizableFunctionPath)(maybeWorklet)) {
            (0, workletSubstitution_1.processWorklet)(maybeWorklet, state);
        }
        else if ((0, types_2.isWorkletizableObjectPath)(maybeWorklet)) {
            (0, objectWorklets_1.processWorkletizableObject)(maybeWorklet, state);
        }
    });
}
function findWorklet(arg, acceptWorkletizableFunction, acceptObject) {
    if (acceptWorkletizableFunction && (0, types_2.isWorkletizableFunctionPath)(arg)) {
        return arg;
    }
    if (acceptObject && (0, types_2.isWorkletizableObjectPath)(arg)) {
        return arg;
    }
    if (arg.isReferencedIdentifier() && arg.isIdentifier()) {
        return (0, referencedWorklets_1.findReferencedWorklet)(arg, acceptWorkletizableFunction, acceptObject);
    }
    return undefined;
}
//# sourceMappingURL=autoworkletization.js.map