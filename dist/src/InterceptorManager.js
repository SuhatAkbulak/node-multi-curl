"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterceptorManager = void 0;
class InterceptorManager {
    constructor() {
        this.handlers = [];
    }
    use(onFulfilled, onRejected) {
        this.handlers.push({
            fulfilled: onFulfilled || ((val) => val),
            rejected: onRejected,
        });
        return this.handlers.length - 1;
    }
    eject(id) {
        if (this.handlers[id]) {
            this.handlers[id] = null;
        }
    }
    async runInterceptors(value) {
        let result = value;
        for (const handler of this.handlers) {
            if (handler) {
                result = await handler.fulfilled(result);
            }
        }
        return result;
    }
}
exports.InterceptorManager = InterceptorManager;
