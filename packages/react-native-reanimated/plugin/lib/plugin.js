"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const autoworkletization_1 = require("./autoworkletization");
const contextObject_1 = require("./contextObject");
const file_1 = require("./file");
const globals_1 = require("./globals");
const inlineStylesWarning_1 = require("./inlineStylesWarning");
const types_1 = require("./types");
const utils_1 = require("./utils");
const webOptimization_1 = require("./webOptimization");
const workletSubstitution_1 = require("./workletSubstitution");
const class_1 = require("./class");
module.exports = function () {
    function runWithTaggedExceptions(fun) {
        try {
            fun();
        }
        catch (e) {
            throw new Error(`[Reanimated] Babel plugin exception: ${e}`);
        }
    }
    return {
        pre(state) {
            runWithTaggedExceptions(() => {
                state.workletNumber = 1;
                (0, globals_1.initializeGlobals)();
                utils_1.addCustomGlobals.call(this);
            });
        },
        visitor: {
            CallExpression: {
                enter(path, state) {
                    runWithTaggedExceptions(() => {
                        (0, autoworkletization_1.processCalleesAutoworkletizableCallbacks)(path, state);
                        if (state.opts.substituteWebPlatformChecks) {
                            (0, webOptimization_1.substituteWebCallExpression)(path);
                        }
                    });
                },
            },
            [types_1.WorkletizableFunction]: {
                enter(path, state) {
                    runWithTaggedExceptions(() => {
                        (0, workletSubstitution_1.processIfWithWorkletDirective)(path, state) ||
                            (0, autoworkletization_1.processIfAutoworkletizableCallback)(path, state);
                    });
                },
            },
            ObjectExpression: {
                enter(path, state) {
                    runWithTaggedExceptions(() => {
                        (0, contextObject_1.processIfWorkletContextObject)(path, state);
                    });
                },
            },
            ClassDeclaration: {
                enter(path, state) {
                    runWithTaggedExceptions(() => {
                        (0, class_1.processIfWorkletClass)(path, state);
                    });
                },
            },
            Program: {
                enter(path, state) {
                    runWithTaggedExceptions(() => {
                        state.workletNumber = 1;
                        (0, file_1.processIfWorkletFile)(path, state);
                    });
                },
            },
            JSXAttribute: {
                enter(path, state) {
                    runWithTaggedExceptions(() => (0, inlineStylesWarning_1.processInlineStylesWarning)(path, state));
                },
            },
        },
    };
};
//# sourceMappingURL=plugin.js.map