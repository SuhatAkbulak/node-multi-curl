"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
class Request {
    constructor(options) {
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
exports.Request = Request;
