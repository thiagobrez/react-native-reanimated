import type { NodePath } from '@babel/core';
import type { CallExpression } from '@babel/types';
import type { WorkletizableFunction, ReanimatedPluginPass } from './types';
export declare function processIfAutoworkletizableCallback(path: NodePath<WorkletizableFunction>, state: ReanimatedPluginPass): boolean;
export declare function processCalleesAutoworkletizableCallbacks(path: NodePath<CallExpression>, state: ReanimatedPluginPass): void;
