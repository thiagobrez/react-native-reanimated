"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorkletString = void 0;
const core_1 = require("@babel/core");
const generator_1 = __importDefault(require("@babel/generator"));
const types_1 = require("@babel/types");
const assert_1 = require("assert");
const convertSourceMap = __importStar(require("convert-source-map"));
const fs = __importStar(require("fs"));
const types_2 = require("./types");
const utils_1 = require("./utils");
const MOCK_SOURCE_MAP = 'mock source map';
function buildWorkletString(fun, state, closureVariables, workletName, inputMap) {
    restoreRecursiveCalls(fun, workletName);
    const draftExpression = (fun.program.body.find((obj) => (0, types_1.isFunctionDeclaration)(obj)) ||
        fun.program.body.find((obj) => (0, types_1.isExpressionStatement)(obj)) ||
        undefined);
    (0, assert_1.strict)(draftExpression, '[Reanimated] `draftExpression` is undefined.');
    const expression = (0, types_1.isFunctionDeclaration)(draftExpression)
        ? draftExpression
        : draftExpression.expression;
    (0, assert_1.strict)('params' in expression, "'params' property is undefined in 'expression'");
    (0, assert_1.strict)((0, types_1.isBlockStatement)(expression.body), '[Reanimated] `expression.body` is not a `BlockStatement`');
    const parsedClasses = new Set();
    (0, core_1.traverse)(fun, {
        NewExpression(path) {
            if (!(0, types_1.isIdentifier)(path.node.callee)) {
                return;
            }
            const constructorName = path.node.callee.name;
            if (!closureVariables.some((variable) => variable.name === constructorName) ||
                parsedClasses.has(constructorName)) {
                return;
            }
            const index = closureVariables.findIndex((variable) => variable.name === constructorName);
            closureVariables.splice(index, 1);
            const workletClassFactoryName = constructorName + types_2.workletClassFactorySuffix;
            closureVariables.push((0, types_1.identifier)(workletClassFactoryName));
            (0, types_1.assertBlockStatement)(expression.body);
            expression.body.body.unshift((0, types_1.variableDeclaration)('const', [
                (0, types_1.variableDeclarator)((0, types_1.identifier)(constructorName), (0, types_1.callExpression)((0, types_1.identifier)(workletClassFactoryName), [])),
            ]));
            parsedClasses.add(constructorName);
        },
    });
    const workletFunction = (0, types_1.functionExpression)((0, types_1.identifier)(workletName), expression.params, expression.body, expression.generator, expression.async);
    const code = (0, generator_1.default)(workletFunction).code;
    (0, assert_1.strict)(inputMap, '[Reanimated] `inputMap` is undefined.');
    const includeSourceMap = !((0, utils_1.isRelease)() || state.opts.disableSourceMaps);
    if (includeSourceMap) {
        inputMap.sourcesContent = [];
        for (const sourceFile of inputMap.sources) {
            inputMap.sourcesContent.push(fs.readFileSync(sourceFile).toString('utf-8'));
        }
    }
    const transformed = (0, core_1.transformSync)(code, {
        plugins: [prependClosureVariablesIfNecessary(closureVariables)],
        compact: true,
        sourceMaps: includeSourceMap,
        inputSourceMap: inputMap,
        ast: false,
        babelrc: false,
        configFile: false,
        comments: false,
    });
    (0, assert_1.strict)(transformed, '[Reanimated] `transformed` is null.');
    let sourceMap;
    if (includeSourceMap) {
        if (shouldMockSourceMap()) {
            sourceMap = MOCK_SOURCE_MAP;
        }
        else {
            sourceMap = convertSourceMap.fromObject(transformed.map).toObject();
            delete sourceMap.sourcesContent;
        }
    }
    return [transformed.code, JSON.stringify(sourceMap)];
}
exports.buildWorkletString = buildWorkletString;
function restoreRecursiveCalls(file, newName) {
    (0, core_1.traverse)(file, {
        FunctionExpression(path) {
            if (!path.node.id) {
                path.stop();
                return;
            }
            const oldName = path.node.id.name;
            const scope = path.scope;
            scope.rename(oldName, newName);
        },
    });
}
function shouldMockSourceMap() {
    return process.env.REANIMATED_JEST_SHOULD_MOCK_SOURCE_MAP === '1';
}
function prependClosure(path, closureVariables, closureDeclaration) {
    if (closureVariables.length === 0 || !(0, types_1.isProgram)(path.parent)) {
        return;
    }
    if (!(0, types_1.isExpression)(path.node.body)) {
        path.node.body.body.unshift(closureDeclaration);
    }
}
function prependRecursiveDeclaration(path) {
    var _a;
    if ((0, types_1.isProgram)(path.parent) &&
        !(0, types_1.isArrowFunctionExpression)(path.node) &&
        !(0, types_1.isObjectMethod)(path.node) &&
        path.node.id &&
        path.scope.parent) {
        const hasRecursiveCalls = ((_a = path.scope.parent.bindings[path.node.id.name]) === null || _a === void 0 ? void 0 : _a.references) > 0;
        if (hasRecursiveCalls) {
            path.node.body.body.unshift((0, types_1.variableDeclaration)('const', [
                (0, types_1.variableDeclarator)((0, types_1.identifier)(path.node.id.name), (0, types_1.memberExpression)((0, types_1.thisExpression)(), (0, types_1.identifier)('_recur'))),
            ]));
        }
    }
}
function prependClosureVariablesIfNecessary(closureVariables) {
    const closureDeclaration = (0, types_1.variableDeclaration)('const', [
        (0, types_1.variableDeclarator)((0, types_1.objectPattern)(closureVariables.map((variable) => (0, types_1.objectProperty)((0, types_1.identifier)(variable.name), (0, types_1.identifier)(variable.name), false, true))), (0, types_1.memberExpression)((0, types_1.thisExpression)(), (0, types_1.identifier)('__closure'))),
    ]);
    return {
        visitor: {
            'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression|ObjectMethod': (path) => {
                prependClosure(path, closureVariables, closureDeclaration);
                prependRecursiveDeclaration(path);
            },
        },
    };
}
//# sourceMappingURL=workletStringCode.js.map