"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.substituteWebCallExpression = void 0;
const types_1 = require("@babel/types");
function substituteWebCallExpression(path) {
    const callee = path.node.callee;
    if ((0, types_1.isIdentifier)(callee)) {
        const name = callee.name;
        if (name === 'isWeb' || name === 'shouldBeUseWeb') {
            path.replaceWith((0, types_1.booleanLiteral)(true));
        }
    }
}
exports.substituteWebCallExpression = substituteWebCallExpression;
//# sourceMappingURL=substituteWebCallExpression.js.map