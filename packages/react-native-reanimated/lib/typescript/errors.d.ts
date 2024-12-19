import type { WorkletStackDetails } from './commonTypes';
export declare function registerWorkletStackDetails(hash: number, stackDetails: WorkletStackDetails): void;
export declare function reportFatalErrorOnJS({ message, stack, }: {
    message: string;
    stack?: string;
}): void;
//# sourceMappingURL=errors.d.ts.map