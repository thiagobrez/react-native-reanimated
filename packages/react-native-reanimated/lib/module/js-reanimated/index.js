'use strict';

import JSReanimated from './JSReanimated';
import { createReactDOMStyle, createTransformValue, createTextShadowValue } from './webUtils';
import { PropsAllowlists } from '../propsAllowlists';
const reanimatedJS = new JSReanimated();
global._makeShareableClone = () => {
  throw new Error('[Reanimated] _makeShareableClone should never be called in JSReanimated.');
};
global._scheduleOnJS = () => {
  throw new Error('[Reanimated] _scheduleOnJS should never be called in JSReanimated.');
};
global._scheduleOnRuntime = () => {
  throw new Error('[Reanimated] _scheduleOnRuntime should never be called in JSReanimated.');
};
export const _updatePropsJS = (updates, viewRef, isAnimatedProps) => {
  if (viewRef) {
    const component = viewRef.getAnimatableRef ? viewRef.getAnimatableRef() : viewRef;
    const [rawStyles] = Object.keys(updates).reduce((acc, key) => {
      const value = updates[key];
      const index = typeof value === 'function' ? 1 : 0;
      acc[index][key] = value;
      return acc;
    }, [{}, {}]);
    if (typeof component.setNativeProps === 'function') {
      // This is the legacy way to update props on React Native Web <= 0.18.
      // Also, some components (e.g. from react-native-svg) don't have styles
      // and always provide setNativeProps function instead (even on React Native Web 0.19+).
      setNativeProps(component, rawStyles, isAnimatedProps);
    } else if (createReactDOMStyle !== undefined && component.style !== undefined) {
      // React Native Web 0.19+ no longer provides setNativeProps function,
      // so we need to update DOM nodes directly.
      updatePropsDOM(component, rawStyles, isAnimatedProps);
    } else if (Object.keys(component.props).length > 0) {
      Object.keys(component.props).forEach(key => {
        if (!rawStyles[key]) {
          return;
        }
        const dashedKey = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
        component._touchableNode.setAttribute(dashedKey, rawStyles[key]);
      });
    } else {
      const componentName = 'className' in component ? component?.className : '';
      console.warn(`[Reanimated] It's not possible to manipulate the component ${componentName}`);
    }
  }
};
const setNativeProps = (component, newProps, isAnimatedProps) => {
  if (isAnimatedProps) {
    const uiProps = {};
    for (const key in newProps) {
      if (isNativeProp(key)) {
        uiProps[key] = newProps[key];
      }
    }
    // Only update UI props directly on the component,
    // other props can be updated as standard style props.
    component.setNativeProps?.(uiProps);
  }
  const previousStyle = component.previousStyle ? component.previousStyle : {};
  const currentStyle = {
    ...previousStyle,
    ...newProps
  };
  component.previousStyle = currentStyle;
  component.setNativeProps?.({
    style: currentStyle
  });
};
const updatePropsDOM = (component, style, isAnimatedProps) => {
  const previousStyle = component.previousStyle ? component.previousStyle : {};
  const currentStyle = {
    ...previousStyle,
    ...style
  };
  component.previousStyle = currentStyle;
  const domStyle = createReactDOMStyle(currentStyle);
  if (Array.isArray(domStyle.transform) && createTransformValue !== undefined) {
    domStyle.transform = createTransformValue(domStyle.transform);
  }
  if (createTextShadowValue !== undefined && (domStyle.textShadowColor || domStyle.textShadowRadius || domStyle.textShadowOffset)) {
    domStyle.textShadow = createTextShadowValue({
      textShadowColor: domStyle.textShadowColor,
      textShadowOffset: domStyle.textShadowOffset,
      textShadowRadius: domStyle.textShadowRadius
    });
  }
  for (const key in domStyle) {
    if (isAnimatedProps) {
      component.setAttribute(key, domStyle[key]);
    } else {
      component.style[key] = domStyle[key];
    }
  }
};
function isNativeProp(propName) {
  return !!PropsAllowlists.NATIVE_THREAD_PROPS_WHITELIST[propName];
}
export default reanimatedJS;
//# sourceMappingURL=index.js.map