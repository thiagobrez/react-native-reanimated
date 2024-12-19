import type { NodePath } from '@babel/core';
import type { JSXAttribute } from '@babel/types';
import type { ReanimatedPluginPass } from './types';
export declare function processInlineStylesWarning(path: NodePath<JSXAttribute>, state: ReanimatedPluginPass): void;
