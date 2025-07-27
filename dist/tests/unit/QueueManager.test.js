"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QueueManager_1 = require("../../src/QueueManager");
describe('QueueManager', () => {
    let queueManager;
    beforeEach(() => {
        queueManager = new QueueManager_1.QueueManager({ concurrency: 2 });
    });
    test('add should execute task and return result', async () => {
        const task = jest.fn().mockResolvedValue('result');
        const result = await queueManager.add(task);
        expect(task).toHaveBeenCalled();
        expect(result).toBe('result');
    });
    test('should limit concurrent tasks', async () => {
        let runningTasks = 0;
        let maxRunningTasks = 0;
        // Create tasks that track concurrency
        const createTask = () => async () => {
            runningTasks++;
            maxRunningTasks = Math.max(maxRunningTasks, runningTasks);
            await new Promise(resolve => setTimeout(resolve, 50));
            runningTasks--;
            return 'done';
        };
        // Queue 5 tasks
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(queueManager.add(createTask()));
        }
        await Promise.all(promises);
        // The max number of concurrent tasks should be 2
        expect(maxRunningTasks).toBe(2);
    });
});
