import { exec } from 'child_process';
import { Request } from './Request';
import { Response } from './Response';
import { ProxyManager } from './proxy/ProxyManager';
import { QueueManager } from './QueueManager';
import { IMultiCurlOptions, IRequestOptions } from './types';
import { InterceptorManager } from './InterceptorManager';

export class MultiCurl {
  private requests: Request[] = [];
  private proxyManager?: ProxyManager;
  private queueManager: QueueManager;
  private concurrency: number;
  private timeout: number;
  private retries: number;
  private useDockerCurl: boolean;
  private dockerImage: string;
  
  // Interceptorlar ekleyelim
  readonly interceptors = {
    request: new InterceptorManager<Request>(),
    response: new InterceptorManager<Response>()
  };

  // Axios-benzeri statik metodlar
  static async get(url: string, options: Partial<IRequestOptions> = {}): Promise<Response> {
    const client = new MultiCurl();
    return (await client.execute([{ url, method: 'GET', ...options }]))[0];
  }

  static async post(url: string, data?: any, options: Partial<IRequestOptions> = {}): Promise<Response> {
    const client = new MultiCurl();
    return (await client.execute([{ url, method: 'POST', body: data, ...options }]))[0];
  }

  static async put(url: string, data?: any, options: Partial<IRequestOptions> = {}): Promise<Response> {
    const client = new MultiCurl();
    return (await client.execute([{ url, method: 'PUT', body: data, ...options }]))[0];
  }

  static async delete(url: string, options: Partial<IRequestOptions> = {}): Promise<Response> {
    const client = new MultiCurl();
    return (await client.execute([{ url, method: 'DELETE', ...options }]))[0];
  }

  // Axios benzeri create metodu
  static create(options: IMultiCurlOptions = {}): MultiCurl {
    return new MultiCurl(options);
  }

  constructor(options: IMultiCurlOptions = {}) {
    this.concurrency = options.concurrency || 5;
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 2;
    this.useDockerCurl = options.curlConfig?.useDocker || false;
    this.dockerImage = options.curlConfig?.dockerImage || 'badouralix/curl-http2:latest';
    
    this.queueManager = new QueueManager({
      concurrency: this.concurrency
    });

    if (options.proxies && options.proxies.length > 0) {
      this.proxyManager = new ProxyManager(options.proxies);
    }
  }

  // Axios-benzeri instance metodları
  async get(url: string, options: Partial<IRequestOptions> = {}): Promise<Response> {
    return (await this.execute([{ url, method: 'GET', ...options }]))[0];
  }

  async post(url: string, data?: any, options: Partial<IRequestOptions> = {}): Promise<Response> {
    return (await this.execute([{ url, method: 'POST', body: data, ...options }]))[0];
  }

  async put(url: string, data?: any, options: Partial<IRequestOptions> = {}): Promise<Response> {
    return (await this.execute([{ url, method: 'PUT', body: data, ...options }]))[0];
  }

  async delete(url: string, options: Partial<IRequestOptions> = {}): Promise<Response> {
    return (await this.execute([{ url, method: 'DELETE', ...options }]))[0];
  }

  // Mevcut metodlar aynen kalıyor
  addRequest(options: IRequestOptions): Request {
    const request = new Request(options);
    this.requests.push(request);
    return request;
  }

  // Add multiple requests at once
  addRequests(requestsOptions: IRequestOptions[]): Request[] {
    return requestsOptions.map(options => this.addRequest(options));
  }

  // Execute can now accept requests directly or use previously added ones
  async execute(requestsOptions?: IRequestOptions[]): Promise<Response[]> {
    // If requests provided directly, add them
    if (requestsOptions && requestsOptions.length > 0) {
      this.addRequests(requestsOptions);
    }
    
    const promises = this.requests.map(request => {
      return this.queueManager.add(() => this.executeRequest(request));
    });

    const responses = await Promise.all(promises);
    
    // Reset requests array after execution
    this.requests = [];
    
    return responses;
  }

  private async executeRequest(request: Request, attemptCount = 0): Promise<Response> {
    try {
      // İstek interceptor'larını çalıştır
      request = await this.interceptors.request.runInterceptors(request);
      
      // Docker kontrolü
      if (this.useDockerCurl) {
        const dockerAvailable = await this.isDockerAvailable();
        if (!dockerAvailable) {
          this.useDockerCurl = false; // Docker yerine yerel curl kullan
        }
      }

      // Apply proxy if configured
      if (this.proxyManager) {
        const proxy = this.proxyManager.getNextProxy();
        if (proxy) {
          request.proxy = proxy;
        }
      }

      const curlCommand = this.buildCurlCommand(request);
      
      return new Promise((resolve, reject) => {
        exec(curlCommand, { timeout: this.timeout }, async (error, stdout, stderr) => {
          if (error && error.killed) {
            return reject(new Error(`Request timed out after ${this.timeout}ms`));
          }
          
          if (error && attemptCount < this.retries) {
            // Retry the request
            return this.executeRequest(request, attemptCount + 1)
              .then(resolve)
              .catch(reject);
          }

          if (error) {
            return reject(error);
          }

          // Yanıt nesnesini oluştur
          let response = new Response({
            url: request.url,
            body: this.extractBody(stdout),
            error: stderr || null,
            statusCode: this.extractStatusCode(stdout, stderr),
            headers: this.extractHeaders(stdout),
            request
          });
          
          // Yanıt interceptor'larını çalıştır
          response = await this.interceptors.response.runInterceptors(response);
          
          resolve(response);  // ❌ Yanlış! Bu Promise'i çözümlemez
        });
      });
    } catch (error) {
      if (attemptCount < this.retries) {
        return this.executeRequest(request, attemptCount + 1);
      }
      throw error;
    }
  }

  private buildCurlCommand(request: Request): string {
    let curlParams = '-s -k --compressed';
    
    // Add method
    if (request.method && request.method !== 'GET') {
      curlParams += ` -X ${request.method}`;
    }
    
    // Add headers
    if (request.headers) {
      for (const [key, value] of Object.entries(request.headers)) {
        curlParams += ` -H '${key}: ${value}'`;
      }
    }
    
    // Add request body
    if (request.body) {
      if (typeof request.body === 'string') {
        curlParams += ` -d '${request.body}'`;
      } else {
        curlParams += ` -d '${JSON.stringify(request.body)}'`;
      }
    }
    
    // Add proxy if specified
    if (request.proxy) {
      curlParams += ` --proxy '${request.proxy}'`;
    }
    
    // Include response headers
    curlParams += ' -i';
    
    // Add URL
    curlParams += ` '${request.url}'`;
    
    // Use Docker or local curl based on configuration
    if (this.useDockerCurl) {
      return `docker run --rm ${this.dockerImage} curl ${curlParams}`;
    } else {
      return `curl ${curlParams}`;
    }
  }

  private extractStatusCode(stdout: string, stderr: string): number {
    if (stderr) {
      return 0;
    }
    
    // HTTP durum kodunu bul
    const statusMatch = stdout.match(/HTTP\/\d+(?:\.\d+)?\s+(\d+)/i);
    
    if (statusMatch && statusMatch[1]) {
      return parseInt(statusMatch[1], 10);
    }
    
    // Eğer bulunamazsa, başarılı olarak varsay
    return 200;
  }

  private extractHeaders(stdout: string): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Split the response to get headers and body
    const headerEnd = stdout.indexOf('\r\n\r\n') !== -1 
      ? stdout.indexOf('\r\n\r\n') 
      : stdout.indexOf('\n\n');
      
    if (headerEnd === -1) return headers;
    
    const headersSection = stdout.substring(0, headerEnd);
    // Split by CRLF or LF
    const headerLines = headersSection.split(/\r\n|\n/);
    
    // Skip the status line (first line)
    for (let i = 1; i < headerLines.length; i++) {
      const line = headerLines[i];
      const separatorIndex = line.indexOf(':');
      if (separatorIndex > 0) {
        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + 1).trim();
        headers[key] = value;
      }
    }
    
    return headers;
  }

  private extractBody(stdout: string): string {
    // Find the end of headers
    const headerEnd = stdout.indexOf('\r\n\r\n') !== -1 
      ? stdout.indexOf('\r\n\r\n') + 4 
      : stdout.indexOf('\n\n') + 2;
      
    if (headerEnd === -1) return stdout;
    
    return stdout.substring(headerEnd);
  }

  private async isDockerAvailable(): Promise<boolean> {
    return new Promise(resolve => {
      exec('docker -v', error => {
        resolve(!error);
      });
    });
  }
}