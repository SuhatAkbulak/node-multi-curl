import { IRequestOptions } from './types';

export class Request {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  proxy?: string;
  timeout?: number;
  id: string;
  startTime: number;

  constructor(options: IRequestOptions) {
    this.url = options.url;
    this.method = options.method || 'GET';
    this.headers = options.headers || {};
    this.body = options.body;
    this.proxy = options.proxy;
    this.timeout = options.timeout;
    this.id = options.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
  }
}