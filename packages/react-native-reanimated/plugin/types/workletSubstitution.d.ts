import type { NodePath } from '@babel/core';
import type { ObjectMethod, CallExpression, FunctionDeclaration } from '@babel/types';
import type { ReanimatedPluginPass } from './types';
import { WorkletizableFunction } from './types';
export declare function processIfWithWorkletDirective(path: NodePath<WorkletizableFunction>, state: ReanimatedPluginPass): boolean;
export declare function processWorklet(path: NodePath<WorkletizableFunction>, state: ReanimatedPluginPass): void;
export declare function substituteObjectMethodWithObjectProperty(path: NodePath<ObjectMethod>, workletFactoryCall: CallExpression): void;
export declare function maybeSubstituteFunctionDeclarationWithVariableDeclaration(path: NodePath<FunctionDeclaration>, workletFactoryCall: CallExpression): void;
