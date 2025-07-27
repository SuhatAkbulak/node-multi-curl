export class ProxyManager {
  private proxies: string[];
  private currentIndex: number = 0;

  constructor(proxies: string[]) {
    this.proxies = proxies;
  }

  getNextProxy(): string {
    if (this.proxies.length === 0) {
      return '';
    }

    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }

  addProxy(proxy: string): void {
    if (!this.proxies.includes(proxy)) {
      this.proxies.push(proxy);
    }
  }

  removeProxy(proxy: string): void {
    const index = this.proxies.indexOf(proxy);
    if (index !== -1) {
      this.proxies.splice(index, 1);
      if (this.currentIndex >= this.proxies.length) {
        this.currentIndex = 0;
      }
    }
  }

  getProxiesCount(): number {
    return this.proxies.length;
  }
}