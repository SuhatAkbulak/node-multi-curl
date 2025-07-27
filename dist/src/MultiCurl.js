"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiCurl = void 0;
const child_process_1 = require("child_process");
const Request_1 = require("./Request");
const Response_1 = require("./Response");
const ProxyManager_1 = require("./proxy/ProxyManager");
const QueueManager_1 = require("./QueueManager");
const InterceptorManager_1 = require("./InterceptorManager");
class MultiCurl {
    // Axios-benzeri statik metodlar
    static async get(url, options = {}) {
        const client = new MultiCurl();
        return (await client.execute([{ url, method: 'GET', ...options }]))[0];
    }
    static async post(url, data, options = {}) {
        const client = new MultiCurl();
        return (await client.execute([{ url, method: 'POST', body: data, ...options }]))[0];
    }
    static async put(url, data, options = {}) {
        const client = new MultiCurl();
        return (await client.execute([{ url, method: 'PUT', body: data, ...options }]))[0];
    }
    static async delete(url, options = {}) {
        const client = new MultiCurl();
        return (await client.execute([{ url, method: 'DELETE', ...options }]))[0];
    }
    // Axios benzeri create metodu
    static create(options = {}) {
        return new MultiCurl(options);
    }
    constructor(options = {}) {
        var _a, _b;
        this.requests = [];
        // Interceptorlar ekleyelim
        this.interceptors = {
            request: new InterceptorManager_1.InterceptorManager(),
            response: new InterceptorManager_1.InterceptorManager()
        };
        this.concurrency = options.concurrency || 5;
        this.timeout = options.timeout || 30000;
        this.retries = options.retries || 2;
        this.useDockerCurl = ((_a = options.curlConfig) === null || _a === void 0 ? void 0 : _a.useDocker) || false;
        this.dockerImage = ((_b = options.curlConfig) === null || _b === void 0 ? void 0 : _b.dockerImage) || 'badouralix/curl-http2:latest';
        this.queueManager = new QueueManager_1.QueueManager({
            concurrency: this.concurrency
        });
        if (options.proxies && options.proxies.length > 0) {
            this.proxyManager = new ProxyManager_1.ProxyManager(options.proxies);
        }
    }
    // Axios-benzeri instance metodları
    async get(url, options = {}) {
        return (await this.execute([{ url, method: 'GET', ...options }]))[0];
    }
    async post(url, data, options = {}) {
        return (await this.execute([{ url, method: 'POST', body: data, ...options }]))[0];
    }
    async put(url, data, options = {}) {
        return (await this.execute([{ url, method: 'PUT', body: data, ...options }]))[0];
    }
    async delete(url, options = {}) {
        return (await this.execute([{ url, method: 'DELETE', ...options }]))[0];
    }
    // Mevcut metodlar aynen kalıyor
    addRequest(options) {
        const request = new Request_1.Request(options);
        this.requests.push(request);
        return request;
    }
    // Add multiple requests at once
    addRequests(requestsOptions) {
        return requestsOptions.map(options => this.addRequest(options));
    }
    // Execute can now accept requests directly or use previously added ones
    async execute(requestsOptions) {
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
    async executeRequest(request, attemptCount = 0) {
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
                (0, child_process_1.exec)(curlCommand, { timeout: this.timeout }, async (error, stdout, stderr) => {
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
                    let response = new Response_1.Response({
                        url: request.url,
                        body: this.extractBody(stdout),
                        error: stderr || null,
                        statusCode: this.extractStatusCode(stdout, stderr),
                        headers: this.extractHeaders(stdout),
                        request
                    });
                    // Yanıt interceptor'larını çalıştır
                    response = await this.interceptors.response.runInterceptors(response);
                    resolve(response); // ❌ Yanlış! Bu Promise'i çözümlemez
                });
            });
        }
        catch (error) {
            if (attemptCount < this.retries) {
                return this.executeRequest(request, attemptCount + 1);
            }
            throw error;
        }
    }
    buildCurlCommand(request) {
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
            }
            else {
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
        }
        else {
            return `curl ${curlParams}`;
        }
    }
    extractStatusCode(stdout, stderr) {
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
    extractHeaders(stdout) {
        const headers = {};
        // Split the response to get headers and body
        const headerEnd = stdout.indexOf('\r\n\r\n') !== -1
            ? stdout.indexOf('\r\n\r\n')
            : stdout.indexOf('\n\n');
        if (headerEnd === -1)
            return headers;
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
    extractBody(stdout) {
        // Find the end of headers
        const headerEnd = stdout.indexOf('\r\n\r\n') !== -1
            ? stdout.indexOf('\r\n\r\n') + 4
            : stdout.indexOf('\n\n') + 2;
        if (headerEnd === -1)
            return stdout;
        return stdout.substring(headerEnd);
    }
    async isDockerAvailable() {
        return new Promise(resolve => {
            (0, child_process_1.exec)('docker -v', error => {
                resolve(!error);
            });
        });
    }
}
exports.MultiCurl = MultiCurl;
