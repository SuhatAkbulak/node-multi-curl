export class ProxyManager {
  private proxies: string[];
  private currentIndex: number;

  constructor(proxies: string[]) {
    this.proxies = proxies;
    this.currentIndex = 0;
  }

  getNextProxy(): string | undefined {
    // Eğer proxy listesi boşsa undefined dön
    if (this.proxies.length === 0) {
      return undefined;
    }

    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }
}