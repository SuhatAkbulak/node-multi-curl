export interface Interceptor<T> {
  use(onFulfilled?: (value: T) => T | Promise<T>, 
      onRejected?: (error: any) => any): number;
  eject(id: number): void;
}

export class InterceptorManager<T> implements Interceptor<T> {
  private handlers: Array<{
    fulfilled: (value: T) => T | Promise<T>;
    rejected?: (error: any) => any;
  } | null> = [];

  use(onFulfilled?: (value: T) => T | Promise<T>, onRejected?: (error: any) => any): number {
    this.handlers.push({
      fulfilled: onFulfilled || ((val) => val),
      rejected: onRejected,
    });
    return this.handlers.length - 1;
  }

  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  async runInterceptors(value: T): Promise<T> {
    let result = value;
    for (const handler of this.handlers) {
      if (handler) {
        result = await handler.fulfilled(result);
      }
    }
    return result;
  }
}