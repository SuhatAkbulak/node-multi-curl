import { Request } from './Request';
import { IResponseOptions } from './types';

export class Response {
  url: string;
  body: string;
  error: string | null;
  statusCode: number;
  headers: Record<string, string>;
  request: Request;
  timings: {
    start: number;
    end: number;
    duration: number;
  };

  constructor(options: IResponseOptions) {
    this.url = options.url;
    this.body = options.body;
    this.error = options.error || null;
    this.statusCode = options.statusCode;
    this.headers = options.headers || {};
    this.request = options.request;
    
    const end = Date.now();
    const start = options.request.startTime || end;
    
    this.timings = {
      start,
      end,
      duration: end - start
    };
  }

  isSuccess(): boolean {
    return this.statusCode >= 200 && this.statusCode < 300;
  }

  json<T = any>(): T {
    try {
      return JSON.parse(this.body) as T;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown parsing error';
      const preview = this.body.length > 100 
        ? `${this.body.substring(0, 100)}...` 
        : this.body;
      
      throw new Error(`Failed to parse response as JSON from ${this.url}: ${errorMessage}\nResponse preview: ${preview}`);
    }
  }
}