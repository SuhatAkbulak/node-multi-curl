"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = void 0;
class QueueManager {
    constructor(options) {
        this.running = 0;
        this.queue = [];
        this.concurrency = options.concurrency;
    }
    add(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                task,
                resolve,
                reject,
            });
            this.processQueue();
        });
    }
    processQueue() {
        if (this.running >= this.concurrency || this.queue.length === 0) {
            return;
        }
        const { task, resolve, reject } = this.queue.shift();
        this.running++;
        Promise.resolve()
            .then(() => task())
            .then((result) => {
            this.running--;
            resolve(result);
            this.processQueue();
        }, (error) => {
            this.running--;
            reject(error);
            this.processQueue();
        });
    }
}
exports.QueueManager = QueueManager;
