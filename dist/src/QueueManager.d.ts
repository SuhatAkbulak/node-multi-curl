interface QueueOptions {
    concurrency: number;
}
type QueueTask<T> = () => Promise<T>;
export declare class QueueManager {
    private concurrency;
    private running;
    private queue;
    constructor(options: QueueOptions);
    add<T>(task: QueueTask<T>): Promise<T>;
    private processQueue;
}
export {};
