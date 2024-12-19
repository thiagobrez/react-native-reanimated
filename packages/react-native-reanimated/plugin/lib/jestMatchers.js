"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WORKLET_REGEX = /var _worklet_[0-9]+_init_data/g;
const INLINE_STYLE_WARNING_REGEX = /console\.warn\(require\("react-native-reanimated"\)\.getUseOfValueInStyleWarning\(\)\)/g;
expect.extend({
    toHaveWorkletData(received, expectedMatchCount = 1) {
        var _a;
        const receivedMatchCount = ((_a = received.match(WORKLET_REGEX)) === null || _a === void 0 ? void 0 : _a.length) || 0;
        if (receivedMatchCount === expectedMatchCount) {
            return {
                message: () => `Reanimated: found worklet data ${expectedMatchCount} times`,
                pass: true,
            };
        }
        return {
            message: () => `Reanimated: expected code to have worklet data ${expectedMatchCount} times, but found ${receivedMatchCount}`,
            pass: false,
        };
    },
    toHaveInlineStyleWarning(received, expectedMatchCount = 1) {
        var _a;
        const receivedMatchCount = ((_a = received.match(INLINE_STYLE_WARNING_REGEX)) === null || _a === void 0 ? void 0 : _a.length) || 0;
        if (receivedMatchCount === expectedMatchCount) {
            return {
                message: () => `Reanimated: found inline style warning ${expectedMatchCount} times`,
                pass: true,
            };
        }
        return {
            message: () => `Reanimated: expected to have inline style warning ${expectedMatchCount} times, but found ${receivedMatchCount}`,
            pass: false,
        };
    },
    toHaveLocation(received, expectedLocation) {
        const expectedString = `location: "${expectedLocation}"`;
        const hasLocation = received.includes(expectedLocation);
        if (hasLocation) {
            return {
                message: () => `Reanimated: found location ${expectedString}`,
                pass: true,
            };
        }
        return {
            message: () => `Reanimated: expected to have location ${expectedString}, but it's not present`,
            pass: false,
        };
    },
    toContainInWorkletString(received, expected) {
        const matches = getWorkletString(received);
        if (matches && matches.some((match) => match.includes(expected))) {
            return {
                message: () => `Reanimated: found ${expected} in worklet string`,
                pass: true,
            };
        }
        return {
            message: () => `Reanimated: expected to find\n${expected}\nin worklet string, but it's not present.\nReceived:\n${received}`,
            pass: false,
        };
    },
    toMatchInWorkletString(received, regexp) {
        const matches = getWorkletString(received);
        if (matches && matches.some((match) => match.match(regexp))) {
            return {
                message: () => `Reanimated: found ${regexp} in worklet string`,
                pass: true,
            };
        }
        return {
            message: () => `Reanimated: expected to match\n${regexp}\nin worklet string, but it's not present.\nReceived:\n${received}`,
            pass: false,
        };
    },
});
function getWorkletString(code) {
    const pattern = /code: "((?:[^"\\]|\\.)*)"/gs;
    return code.match(pattern);
}
//# sourceMappingURL=jestMatchers.js.map