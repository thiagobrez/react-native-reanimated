import { TransitionType } from './config';
import type { KeyframeDefinitions } from './config';
import type { TransitionData } from './animationParser';
export declare function createCustomKeyFrameAnimation(keyframeDefinitions: KeyframeDefinitions): string;
/**
 * Creates transition of given type, appends it to stylesheet and returns keyframe name.
 *
 * @param transitionType - Type of transition (e.g. LINEAR).
 * @param transitionData - Object containing data for transforms (translateX, scaleX,...).
 * @returns Keyframe name that represents transition.
 */
export declare function TransitionGenerator(transitionType: TransitionType, transitionData: TransitionData): string;
//# sourceMappingURL=createAnimation.d.ts.map