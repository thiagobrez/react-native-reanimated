import type { NodePath } from '@babel/core';
import type { FunctionExpression } from '@babel/types';
import type { ReanimatedPluginPass, WorkletizableFunction } from './types';
export declare function makeWorkletFactory(fun: NodePath<WorkletizableFunction>, state: ReanimatedPluginPass): FunctionExpression;
