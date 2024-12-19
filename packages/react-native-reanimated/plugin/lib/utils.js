"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceWithFactoryCall = exports.addCustomGlobals = exports.isRelease = void 0;
const types_1 = require("@babel/types");
const globals_1 = require("./globals");
function isRelease() {
    var _a, _b;
    const pattern = /(prod|release|stag[ei])/i;
    return !!(((_a = process.env.BABEL_ENV) === null || _a === void 0 ? void 0 : _a.match(pattern)) ||
        ((_b = process.env.NODE_ENV) === null || _b === void 0 ? void 0 : _b.match(pattern)));
}
exports.isRelease = isRelease;
function addCustomGlobals() {
    if (this.opts && Array.isArray(this.opts.globals)) {
        this.opts.globals.forEach((name) => {
            globals_1.globals.add(name);
        });
    }
}
exports.addCustomGlobals = addCustomGlobals;
function replaceWithFactoryCall(toReplace, name, factoryCall) {
    if (!name || !needsDeclaration(toReplace)) {
        toReplace.replaceWith(factoryCall);
    }
    else {
        const replacement = (0, types_1.variableDeclaration)('const', [
            (0, types_1.variableDeclarator)((0, types_1.identifier)(name), factoryCall),
        ]);
        toReplace.replaceWith(replacement);
    }
}
exports.replaceWithFactoryCall = replaceWithFactoryCall;
function needsDeclaration(nodePath) {
    return ((0, types_1.isScopable)(nodePath.parent) || (0, types_1.isExportNamedDeclaration)(nodePath.parent));
}
//# sourceMappingURL=utils.js.map