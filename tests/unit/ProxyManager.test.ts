import { ProxyManager } from '../../src/proxy/ProxyManager';

describe('ProxyManager', () => {
    let proxyManager: ProxyManager;
    
    beforeEach(() => {
        const proxies = ['http://proxy1.example.com', 'http://proxy2.example.com'];
        proxyManager = new ProxyManager(proxies);
    });

    test('getNextProxy should return proxies in rotation', () => {
        const proxy1 = proxyManager.getNextProxy();
        const proxy2 = proxyManager.getNextProxy();
        const proxy3 = proxyManager.getNextProxy(); // Should wrap around to the first proxy

        expect(proxy1).toBe('http://proxy1.example.com');
        expect(proxy2).toBe('http://proxy2.example.com');
        expect(proxy3).toBe('http://proxy1.example.com');
    });

    test('getNextProxy should return undefined when no proxies are available', () => {
        // Empty proxy manager
        const emptyProxyManager = new ProxyManager([]);
        expect(emptyProxyManager.getNextProxy()).toBeUndefined();
    });
});