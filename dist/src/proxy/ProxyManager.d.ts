export declare class ProxyManager {
    private proxies;
    private currentIndex;
    constructor(proxies: string[]);
    getNextProxy(): string | undefined;
}
