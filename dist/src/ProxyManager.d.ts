export declare class ProxyManager {
    private proxies;
    private currentIndex;
    constructor(proxies: string[]);
    getNextProxy(): string;
    addProxy(proxy: string): void;
    removeProxy(proxy: string): void;
    getProxiesCount(): number;
}
