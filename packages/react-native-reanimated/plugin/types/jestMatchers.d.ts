export {};
declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveWorkletData(times?: number): R;
            toHaveInlineStyleWarning(times?: number): R;
            toHaveLocation(location: string): R;
            toIncludeInWorkletString(expected: string): R;
        }
    }
}
