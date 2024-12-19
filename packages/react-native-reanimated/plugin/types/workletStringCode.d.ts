import type { BabelFileResult } from '@babel/core';
import type { File as BabelFile, Identifier } from '@babel/types';
export declare function buildWorkletString(fun: BabelFile, closureVariables: Array<Identifier>, name: string, inputMap: BabelFileResult['map']): Array<string | null | undefined>;
