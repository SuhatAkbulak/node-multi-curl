"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyManager = void 0;
class ProxyManager {
    constructor(proxies) {
        this.currentIndex = 0;
        this.proxies = proxies;
    }
    getNextProxy() {
        if (this.proxies.length === 0) {
            return '';
        }
        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        return proxy;
    }
    addProxy(proxy) {
        if (!this.proxies.includes(proxy)) {
            this.proxies.push(proxy);
        }
    }
    removeProxy(proxy) {
        const index = this.proxies.indexOf(proxy);
        if (index !== -1) {
            this.proxies.splice(index, 1);
            if (this.currentIndex >= this.proxies.length) {
                this.currentIndex = 0;
            }
        }
    }
    getProxiesCount() {
        return this.proxies.length;
    }
}
exports.ProxyManager = ProxyManager;
