import type { NodePath } from '@babel/core';
import type { Identifier } from '@babel/types';
import type { WorkletizableFunction, WorkletizableObject } from './types';
export declare function findReferencedWorklet(workletIdentifier: NodePath<Identifier>, acceptWorkletizableFunction: boolean, acceptObject: boolean): NodePath<WorkletizableFunction> | NodePath<WorkletizableObject> | undefined;
