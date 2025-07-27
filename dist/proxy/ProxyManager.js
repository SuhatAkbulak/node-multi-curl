"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyManager = void 0;
class ProxyManager {
    constructor(proxies = []) {
        this.proxies = [];
        this.currentIndex = 0;
        this.proxies = proxies;
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
    getNextProxy() {
        if (this.proxies.length === 0) {
            return '';
        }
        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        return proxy;
    }
    getProxiesCount() {
        return this.proxies.length;
    }
}
exports.ProxyManager = ProxyManager;
