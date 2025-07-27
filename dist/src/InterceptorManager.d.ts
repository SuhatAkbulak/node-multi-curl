export interface Interceptor<T> {
    use(onFulfilled?: (value: T) => T | Promise<T>, onRejected?: (error: any) => any): number;
    eject(id: number): void;
}
export declare class InterceptorManager<T> implements Interceptor<T> {
    private handlers;
    use(onFulfilled?: (value: T) => T | Promise<T>, onRejected?: (error: any) => any): number;
    eject(id: number): void;
    runInterceptors(value: T): Promise<T>;
}
