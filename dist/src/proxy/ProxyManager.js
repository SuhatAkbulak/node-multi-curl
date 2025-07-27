"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyManager = void 0;
class ProxyManager {
    constructor(proxies) {
        this.proxies = proxies;
        this.currentIndex = 0;
    }
    getNextProxy() {
        // Eğer proxy listesi boşsa undefined dön
        if (this.proxies.length === 0) {
            return undefined;
        }
        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        return proxy;
    }
}
exports.ProxyManager = ProxyManager;
