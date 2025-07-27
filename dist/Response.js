"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
class Response {
    constructor(options) {
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
    isSuccess() {
        return this.statusCode >= 200 && this.statusCode < 300;
    }
    json() {
        try {
            return JSON.parse(this.body);
        }
        catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown parsing error';
            const preview = this.body.length > 100
                ? `${this.body.substring(0, 100)}...`
                : this.body;
            throw new Error(`Failed to parse response as JSON from ${this.url}: ${errorMessage}\nResponse preview: ${preview}`);
        }
    }
}
exports.Response = Response;
