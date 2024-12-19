import type { NodePath } from '@babel/core';
import type { CallExpression } from '@babel/types';
import type { ReanimatedPluginPass, WorkletizableFunction } from './types';
export declare function makeWorkletFactoryCall(path: NodePath<WorkletizableFunction>, state: ReanimatedPluginPass): CallExpression;
