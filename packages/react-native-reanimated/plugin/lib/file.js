"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImplicitContextObject = exports.processIfWorkletFile = void 0;
const types_1 = require("@babel/types");
const types_2 = require("./types");
const contextObject_1 = require("./contextObject");
function processIfWorkletFile(path, _state) {
    if (!path.node.directives.some((functionDirective) => functionDirective.value.value === 'worklet')) {
        return false;
    }
    path.node.directives = path.node.directives.filter((functionDirective) => functionDirective.value.value !== 'worklet');
    processWorkletFile(path);
    return true;
}
exports.processIfWorkletFile = processIfWorkletFile;
function processWorkletFile(programPath) {
    const statements = programPath.get('body');
    dehoistCommonJSExports(programPath.node);
    statements.forEach((statement) => {
        const candidatePath = getCandidate(statement);
        processWorkletizableEntity(candidatePath);
    });
}
function getCandidate(statementPath) {
    if (statementPath.isExportNamedDeclaration() ||
        statementPath.isExportDefaultDeclaration()) {
        return statementPath.get('declaration');
    }
    else {
        return statementPath;
    }
}
function processWorkletizableEntity(nodePath) {
    if ((0, types_2.isWorkletizableFunctionPath)(nodePath)) {
        if (nodePath.isArrowFunctionExpression()) {
            replaceImplicitReturnWithBlock(nodePath.node);
        }
        appendWorkletDirective(nodePath.node.body);
    }
    else if ((0, types_2.isWorkletizableObjectPath)(nodePath)) {
        if (isImplicitContextObject(nodePath)) {
            appendWorkletContextObjectMarker(nodePath.node);
        }
        else {
            processWorkletAggregator(nodePath);
        }
    }
    else if (nodePath.isVariableDeclaration()) {
        processVariableDeclaration(nodePath);
    }
    else if (nodePath.isClassDeclaration()) {
        appendWorkletClassMarker(nodePath.node.body);
    }
}
function processVariableDeclaration(variableDeclarationPath) {
    const declarations = variableDeclarationPath.get('declarations');
    declarations.forEach((declaration) => {
        const initPath = declaration.get('init');
        if (initPath.isExpression()) {
            processWorkletizableEntity(initPath);
        }
    });
}
function processWorkletAggregator(objectPath) {
    const properties = objectPath.get('properties');
    properties.forEach((property) => {
        if (property.isObjectMethod()) {
            appendWorkletDirective(property.node.body);
        }
        else if (property.isObjectProperty()) {
            const valuePath = property.get('value');
            processWorkletizableEntity(valuePath);
        }
    });
}
function replaceImplicitReturnWithBlock(path) {
    if (!(0, types_1.isBlockStatement)(path.body)) {
        path.body = (0, types_1.blockStatement)([(0, types_1.returnStatement)(path.body)]);
    }
}
function appendWorkletDirective(node) {
    if (!node.directives.some((functionDirective) => functionDirective.value.value === 'worklet')) {
        node.directives.push((0, types_1.directive)((0, types_1.directiveLiteral)('worklet')));
    }
}
function appendWorkletContextObjectMarker(objectExpression) {
    if (objectExpression.properties.some((value) => (0, types_1.isObjectProperty)(value) &&
        (0, types_1.isIdentifier)(value.key) &&
        value.key.name === contextObject_1.contextObjectMarker)) {
        return;
    }
    objectExpression.properties.push((0, types_1.objectProperty)((0, types_1.identifier)(`${contextObject_1.contextObjectMarker}`), (0, types_1.booleanLiteral)(true)));
}
function isImplicitContextObject(path) {
    const propertyPaths = path.get('properties');
    return propertyPaths.some((propertyPath) => {
        if (!propertyPath.isObjectMethod()) {
            return false;
        }
        return hasThisExpression(propertyPath);
    });
}
exports.isImplicitContextObject = isImplicitContextObject;
function hasThisExpression(path) {
    let result = false;
    path.traverse({
        ThisExpression(thisPath) {
            result = true;
            thisPath.stop();
        },
    });
    return result;
}
function appendWorkletClassMarker(classBody) {
    classBody.body.push((0, types_1.classProperty)((0, types_1.identifier)('__workletClass'), (0, types_1.booleanLiteral)(true)));
}
function dehoistCommonJSExports(program) {
    const statements = program.body;
    let end = statements.length;
    let current = 0;
    while (current < end) {
        const statement = statements[current];
        if (!isCommonJSExport(statement)) {
            current++;
            continue;
        }
        const exportStatement = statements.splice(current, 1);
        statements.push(...exportStatement);
        end--;
    }
}
function isCommonJSExport(statement) {
    return ((0, types_1.isExpressionStatement)(statement) &&
        (0, types_1.isAssignmentExpression)(statement.expression) &&
        (0, types_1.isMemberExpression)(statement.expression.left) &&
        (0, types_1.isIdentifier)(statement.expression.left.object) &&
        statement.expression.left.object.name === 'exports');
}
//# sourceMappingURL=file.js.map