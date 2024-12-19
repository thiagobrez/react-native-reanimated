"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processIfWorkletClass = void 0;
const core_1 = require("@babel/core");
const generator_1 = __importDefault(require("@babel/generator"));
const traverse_1 = __importDefault(require("@babel/traverse"));
const types_1 = require("@babel/types");
const assert_1 = require("assert");
const types_2 = require("./types");
const utils_1 = require("./utils");
const classWorkletMarker = '__workletClass';
function processIfWorkletClass(classPath, state) {
    if (!classPath.node.id) {
        return false;
    }
    if (!hasWorkletClassMarker(classPath.node.body)) {
        return false;
    }
    removeWorkletClassMarker(classPath.node.body);
    processClass(classPath, state);
    return true;
}
exports.processIfWorkletClass = processIfWorkletClass;
function processClass(classPath, state) {
    (0, assert_1.strict)(classPath.node.id);
    const className = classPath.node.id.name;
    const polyfilledClassAst = getPolyfilledAst(classPath.node, state);
    sortPolyfills(polyfilledClassAst);
    appendWorkletDirectiveToPolyfills(polyfilledClassAst.program.body);
    replaceClassDeclarationWithFactoryAndCall(polyfilledClassAst.program.body, className);
    polyfilledClassAst.program.body.push((0, types_1.returnStatement)((0, types_1.identifier)(className)));
    const factoryFactory = (0, types_1.functionExpression)(null, [], (0, types_1.blockStatement)([...polyfilledClassAst.program.body]));
    const factoryCall = (0, types_1.callExpression)(factoryFactory, []);
    (0, utils_1.replaceWithFactoryCall)(classPath, className, factoryCall);
}
function getPolyfilledAst(classNode, state) {
    const classCode = (0, generator_1.default)(classNode).code;
    const classWithPolyfills = (0, core_1.transformSync)(classCode, {
        plugins: [
            '@babel/plugin-transform-class-properties',
            '@babel/plugin-transform-classes',
            '@babel/plugin-transform-unicode-regex',
        ],
        filename: state.file.opts.filename,
        ast: true,
        babelrc: false,
        configFile: false,
    });
    (0, assert_1.strict)(classWithPolyfills && classWithPolyfills.ast);
    return classWithPolyfills.ast;
}
function appendWorkletDirectiveToPolyfills(statements) {
    statements.forEach((statement) => {
        if ((0, types_1.isFunctionDeclaration)(statement)) {
            const workletDirective = (0, types_1.directive)((0, types_1.directiveLiteral)('worklet'));
            statement.body.directives.push(workletDirective);
        }
    });
}
function replaceClassDeclarationWithFactoryAndCall(statements, className) {
    const classFactoryName = className + types_2.workletClassFactorySuffix;
    const classDeclarationIndex = getPolyfilledClassDeclarationIndex(statements, className);
    const classDeclarationToReplace = statements[classDeclarationIndex];
    const classDeclarationInit = classDeclarationToReplace.declarations[0]
        .init;
    const classFactoryDeclaration = (0, types_1.functionDeclaration)((0, types_1.identifier)(classFactoryName), [], (0, types_1.blockStatement)([
        (0, types_1.variableDeclaration)('const', [
            (0, types_1.variableDeclarator)((0, types_1.identifier)(className), classDeclarationInit),
        ]),
        (0, types_1.expressionStatement)((0, types_1.assignmentExpression)('=', (0, types_1.memberExpression)((0, types_1.identifier)(className), (0, types_1.identifier)(classFactoryName)), (0, types_1.identifier)(classFactoryName))),
        (0, types_1.returnStatement)((0, types_1.identifier)(className)),
    ], [(0, types_1.directive)((0, types_1.directiveLiteral)('worklet'))]));
    const newClassDeclaration = (0, types_1.variableDeclaration)('const', [
        (0, types_1.variableDeclarator)((0, types_1.identifier)(className), (0, types_1.callExpression)((0, types_1.identifier)(classFactoryName), [])),
    ]);
    statements.splice(classDeclarationIndex, 1, classFactoryDeclaration, newClassDeclaration);
}
function getPolyfilledClassDeclarationIndex(statements, className) {
    const index = statements.findIndex((statement) => (0, types_1.isVariableDeclaration)(statement) &&
        statement.declarations.some((declaration) => (0, types_1.isIdentifier)(declaration.id) && declaration.id.name === className));
    (0, assert_1.strict)(index >= 0);
    return index;
}
function hasWorkletClassMarker(classBody) {
    return classBody.body.some((statement) => (0, types_1.isClassProperty)(statement) &&
        (0, types_1.isIdentifier)(statement.key) &&
        statement.key.name === classWorkletMarker);
}
function removeWorkletClassMarker(classBody) {
    classBody.body = classBody.body.filter((statement) => !(0, types_1.isClassProperty)(statement) ||
        !(0, types_1.isIdentifier)(statement.key) ||
        statement.key.name !== classWorkletMarker);
}
function sortPolyfills(ast) {
    const toSort = getPolyfillsToSort(ast);
    const sorted = topoSort(toSort);
    const toSortIndices = toSort.map((element) => element.index);
    const sortedIndices = sorted.map((element) => element.index);
    const statements = ast.program.body;
    const oldStatements = [...statements];
    for (let i = 0; i < toSort.length; i++) {
        const sourceIndex = sortedIndices[i];
        const targetIndex = toSortIndices[i];
        const source = oldStatements[sourceIndex];
        statements[targetIndex] = source;
    }
}
function getPolyfillsToSort(ast) {
    const polyfills = [];
    (0, traverse_1.default)(ast, {
        Program: {
            enter: (functionPath) => {
                const statements = functionPath.get('body');
                statements.forEach((statement, index) => {
                    var _a;
                    const bindingIdentifiers = statement.getBindingIdentifiers();
                    if (!statement.isFunctionDeclaration() || !((_a = statement.node.id) === null || _a === void 0 ? void 0 : _a.name)) {
                        return;
                    }
                    const element = {
                        name: statement.node.id.name,
                        index,
                        dependencies: new Set(),
                    };
                    polyfills.push(element);
                    statement.traverse({
                        Identifier(path) {
                            if (isOutsideDependency(path, bindingIdentifiers, statement)) {
                                element.dependencies.add(path.node.name);
                            }
                        },
                    });
                });
            },
        },
    });
    return polyfills;
}
function topoSort(toSort) {
    const sorted = [];
    const stack = new Set();
    for (const element of toSort) {
        recursiveTopoSort(element, toSort, sorted, stack);
    }
    return sorted;
}
function recursiveTopoSort(current, toSort, sorted, stack) {
    if (stack.has(current.name)) {
        throw new Error('Cycle detected. This should never happen.');
    }
    if (sorted.find((element) => element.name === current.name)) {
        return;
    }
    stack.add(current.name);
    for (const dependency of current.dependencies) {
        if (!sorted.find((element) => element.name === dependency)) {
            const next = toSort.find((element) => element.name === dependency);
            (0, assert_1.strict)(next);
            recursiveTopoSort(next, toSort, sorted, stack);
        }
    }
    sorted.push(current);
    stack.delete(current.name);
}
function isOutsideDependency(identifierPath, bindingIdentifiers, functionPath) {
    return (identifierPath.isReferencedIdentifier() &&
        !(identifierPath.node.name in bindingIdentifiers) &&
        !functionPath.scope.hasOwnBinding(identifierPath.node.name) &&
        functionPath.scope.hasReference(identifierPath.node.name));
}
//# sourceMappingURL=class.js.map