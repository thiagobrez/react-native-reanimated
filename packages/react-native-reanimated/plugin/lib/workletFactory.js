"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeWorkletFactory = void 0;
const core_1 = require("@babel/core");
const generator_1 = __importDefault(require("@babel/generator"));
const types_1 = require("@babel/types");
const assert_1 = require("assert");
const path_1 = require("path");
const globals_1 = require("./globals");
const types_2 = require("./types");
const utils_1 = require("./utils");
const workletStringCode_1 = require("./workletStringCode");
const REAL_VERSION = require('../../package.json').version;
const MOCK_VERSION = 'x.y.z';
const workletStringTransformPresets = [
    require.resolve('@babel/preset-typescript'),
];
const workletStringTransformPlugins = [
    require.resolve('@babel/plugin-transform-shorthand-properties'),
    require.resolve('@babel/plugin-transform-arrow-functions'),
    require.resolve('@babel/plugin-transform-optional-chaining'),
    require.resolve('@babel/plugin-transform-nullish-coalescing-operator'),
    [
        require.resolve('@babel/plugin-transform-template-literals'),
        { loose: true },
    ],
];
function makeWorkletFactory(fun, state) {
    removeWorkletDirective(fun);
    (0, assert_1.strict)(state.file.opts.filename, '[Reanimated] `state.file.opts.filename` is undefined.');
    const codeObject = (0, generator_1.default)(fun.node, {
        sourceMaps: true,
        sourceFileName: state.file.opts.filename,
    });
    codeObject.code =
        '(' + (fun.isObjectMethod() ? 'function ' : '') + codeObject.code + '\n)';
    const transformed = (0, core_1.transformSync)(codeObject.code, {
        filename: state.file.opts.filename,
        presets: workletStringTransformPresets,
        plugins: workletStringTransformPlugins,
        ast: true,
        babelrc: false,
        configFile: false,
        inputSourceMap: codeObject.map,
    });
    (0, assert_1.strict)(transformed, '[Reanimated] `transformed` is undefined.');
    (0, assert_1.strict)(transformed.ast, '[Reanimated] `transformed.ast` is undefined.');
    const variables = makeArrayFromCapturedBindings(transformed.ast, fun);
    const clone = (0, types_1.cloneNode)(fun.node);
    const funExpression = (0, types_1.isBlockStatement)(clone.body)
        ? (0, types_1.functionExpression)(null, clone.params, clone.body, clone.generator, clone.async)
        : clone;
    const { workletName, reactName } = makeWorkletName(fun, state);
    let [funString, sourceMapString] = (0, workletStringCode_1.buildWorkletString)(transformed.ast, state, variables, workletName, transformed.map);
    (0, assert_1.strict)(funString, '[Reanimated] `funString` is undefined.');
    const workletHash = hash(funString);
    let lineOffset = 1;
    if (variables.length > 0) {
        lineOffset -= variables.length + 2;
    }
    const pathForStringDefinitions = fun.parentPath.isProgram()
        ? fun
        : fun.findParent((path) => { var _a, _b; return (_b = (_a = path.parentPath) === null || _a === void 0 ? void 0 : _a.isProgram()) !== null && _b !== void 0 ? _b : false; });
    (0, assert_1.strict)(pathForStringDefinitions, '[Reanimated] `pathForStringDefinitions` is null.');
    (0, assert_1.strict)(pathForStringDefinitions.parentPath, '[Reanimated] `pathForStringDefinitions.parentPath` is null.');
    const initDataId = pathForStringDefinitions.parentPath.scope.generateUidIdentifier(`worklet_${workletHash}_init_data`);
    const initDataObjectExpression = (0, types_1.objectExpression)([
        (0, types_1.objectProperty)((0, types_1.identifier)('code'), (0, types_1.stringLiteral)(funString)),
    ]);
    const shouldInjectLocation = !(0, utils_1.isRelease)();
    if (shouldInjectLocation) {
        let location = state.file.opts.filename;
        if (state.opts.relativeSourceLocation) {
            location = (0, path_1.relative)(state.cwd, location);
            sourceMapString = sourceMapString === null || sourceMapString === void 0 ? void 0 : sourceMapString.replace(state.file.opts.filename, location);
        }
        initDataObjectExpression.properties.push((0, types_1.objectProperty)((0, types_1.identifier)('location'), (0, types_1.stringLiteral)(location)));
    }
    if (sourceMapString) {
        initDataObjectExpression.properties.push((0, types_1.objectProperty)((0, types_1.identifier)('sourceMap'), (0, types_1.stringLiteral)(sourceMapString)));
    }
    const shouldInjectVersion = !(0, utils_1.isRelease)();
    if (shouldInjectVersion) {
        initDataObjectExpression.properties.push((0, types_1.objectProperty)((0, types_1.identifier)('version'), (0, types_1.stringLiteral)(shouldMockVersion() ? MOCK_VERSION : REAL_VERSION)));
    }
    const shouldIncludeInitData = !state.opts.omitNativeOnlyData;
    if (shouldIncludeInitData) {
        pathForStringDefinitions.insertBefore((0, types_1.variableDeclaration)('const', [
            (0, types_1.variableDeclarator)(initDataId, initDataObjectExpression),
        ]));
    }
    (0, assert_1.strict)(!(0, types_1.isFunctionDeclaration)(funExpression), '[Reanimated] `funExpression` is a `FunctionDeclaration`.');
    (0, assert_1.strict)(!(0, types_1.isObjectMethod)(funExpression), '[Reanimated] `funExpression` is an `ObjectMethod`.');
    const statements = [
        (0, types_1.variableDeclaration)('const', [
            (0, types_1.variableDeclarator)((0, types_1.identifier)(reactName), funExpression),
        ]),
        (0, types_1.expressionStatement)((0, types_1.assignmentExpression)('=', (0, types_1.memberExpression)((0, types_1.identifier)(reactName), (0, types_1.identifier)('__closure'), false), (0, types_1.objectExpression)(variables.map((variable) => variable.name.endsWith(types_2.workletClassFactorySuffix)
            ? (0, types_1.objectProperty)((0, types_1.identifier)(variable.name), (0, types_1.memberExpression)((0, types_1.identifier)(variable.name.slice(0, variable.name.length - types_2.workletClassFactorySuffix.length)), (0, types_1.identifier)(variable.name)))
            : (0, types_1.objectProperty)((0, types_1.identifier)(variable.name), variable, false, true))))),
        (0, types_1.expressionStatement)((0, types_1.assignmentExpression)('=', (0, types_1.memberExpression)((0, types_1.identifier)(reactName), (0, types_1.identifier)('__workletHash'), false), (0, types_1.numericLiteral)(workletHash))),
    ];
    if (shouldIncludeInitData) {
        statements.push((0, types_1.expressionStatement)((0, types_1.assignmentExpression)('=', (0, types_1.memberExpression)((0, types_1.identifier)(reactName), (0, types_1.identifier)('__initData'), false), initDataId)));
    }
    if (!(0, utils_1.isRelease)()) {
        statements.unshift((0, types_1.variableDeclaration)('const', [
            (0, types_1.variableDeclarator)((0, types_1.identifier)('_e'), (0, types_1.arrayExpression)([
                (0, types_1.newExpression)((0, types_1.memberExpression)((0, types_1.identifier)('global'), (0, types_1.identifier)('Error')), []),
                (0, types_1.numericLiteral)(lineOffset),
                (0, types_1.numericLiteral)(-27),
            ])),
        ]));
        statements.push((0, types_1.expressionStatement)((0, types_1.assignmentExpression)('=', (0, types_1.memberExpression)((0, types_1.identifier)(reactName), (0, types_1.identifier)('__stackDetails'), false), (0, types_1.identifier)('_e'))));
    }
    statements.push((0, types_1.returnStatement)((0, types_1.identifier)(reactName)));
    const newFun = (0, types_1.functionExpression)(undefined, [], (0, types_1.blockStatement)(statements));
    return newFun;
}
exports.makeWorkletFactory = makeWorkletFactory;
function removeWorkletDirective(fun) {
    fun.traverse({
        DirectiveLiteral(path) {
            if (path.node.value === 'worklet' && path.getFunctionParent() === fun) {
                path.parentPath.remove();
            }
        },
    });
}
function shouldMockVersion() {
    return process.env.REANIMATED_JEST_SHOULD_MOCK_VERSION === '1';
}
function hash(str) {
    let i = str.length;
    let hash1 = 5381;
    let hash2 = 52711;
    while (i--) {
        const char = str.charCodeAt(i);
        hash1 = (hash1 * 33) ^ char;
        hash2 = (hash2 * 33) ^ char;
    }
    return (hash1 >>> 0) * 4096 + (hash2 >>> 0);
}
function makeWorkletName(fun, state) {
    let source = 'unknownFile';
    if (state.file.opts.filename) {
        const filepath = state.file.opts.filename;
        source = (0, path_1.basename)(filepath);
        const splitFilepath = filepath.split('/');
        const nodeModulesIndex = splitFilepath.indexOf('node_modules');
        if (nodeModulesIndex !== -1) {
            const libraryName = splitFilepath[nodeModulesIndex + 1];
            source = `${libraryName}_${source}`;
        }
    }
    const suffix = `${source}${state.workletNumber++}`;
    let reactName = '';
    if ((0, types_1.isObjectMethod)(fun.node) && (0, types_1.isIdentifier)(fun.node.key)) {
        reactName = fun.node.key.name;
    }
    else if (((0, types_1.isFunctionDeclaration)(fun.node) || (0, types_1.isFunctionExpression)(fun.node)) &&
        (0, types_1.isIdentifier)(fun.node.id)) {
        reactName = fun.node.id.name;
    }
    const workletName = reactName
        ? (0, types_1.toIdentifier)(`${reactName}_${suffix}`)
        : (0, types_1.toIdentifier)(suffix);
    reactName = reactName || (0, types_1.toIdentifier)(suffix);
    return { workletName, reactName };
}
function makeArrayFromCapturedBindings(ast, fun) {
    const closure = new Map();
    const isLocationAssignedMap = new Map();
    (0, core_1.traverse)(ast, {
        Identifier(path) {
            if (!path.isReferencedIdentifier()) {
                return;
            }
            const name = path.node.name;
            if (globals_1.globals.has(name)) {
                return;
            }
            if ('id' in fun.node &&
                fun.node.id &&
                fun.node.id.name === name) {
                return;
            }
            const parentNode = path.parent;
            if ((0, types_1.isMemberExpression)(parentNode) &&
                parentNode.property === path.node &&
                !parentNode.computed) {
                return;
            }
            if ((0, types_1.isObjectProperty)(parentNode) &&
                (0, types_1.isObjectExpression)(path.parentPath.parent) &&
                path.node !== parentNode.value) {
                return;
            }
            let currentScope = path.scope;
            while (currentScope != null) {
                if (currentScope.bindings[name] != null) {
                    return;
                }
                currentScope = currentScope.parent;
            }
            closure.set(name, path.node);
            isLocationAssignedMap.set(name, false);
        },
    });
    fun.traverse({
        Identifier(path) {
            if (!path.isReferencedIdentifier()) {
                return;
            }
            const node = closure.get(path.node.name);
            if (!node || isLocationAssignedMap.get(path.node.name)) {
                return;
            }
            node.loc = path.node.loc;
            isLocationAssignedMap.set(path.node.name, true);
        },
    });
    return Array.from(closure.values());
}
//# sourceMappingURL=workletFactory.js.map