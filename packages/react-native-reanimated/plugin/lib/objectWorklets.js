"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWorkletizableObject = void 0;
const types_1 = require("./types");
const workletSubstitution_1 = require("./workletSubstitution");
function processWorkletizableObject(path, state) {
    const properties = path.get('properties');
    for (const property of properties) {
        if (property.isObjectMethod()) {
            (0, workletSubstitution_1.processWorklet)(property, state);
        }
        else if (property.isObjectProperty()) {
            const value = property.get('value');
            if ((0, types_1.isWorkletizableFunctionPath)(value)) {
                (0, workletSubstitution_1.processWorklet)(value, state);
            }
        }
        else {
            throw new Error(`[Reanimated] '${property.type}' as to-be workletized argument is not supported for object hooks.`);
        }
    }
}
exports.processWorkletizableObject = processWorkletizableObject;
//# sourceMappingURL=objectWorklets.js.map