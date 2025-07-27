import { QueueManager } from '../../src/QueueManager';
import { Request } from '../../src/Request';

describe('QueueManager', () => {
    let queueManager: QueueManager;
    
    beforeEach(() => {
        queueManager = new QueueManager({ concurrency: 2 });
    });

    test('should add a task to the queue', async () => {
        const taskResult = 'test result';
        const task = jest.fn().mockResolvedValue(taskResult);
        
        const result = await queueManager.add(task);
        
        expect(task).toHaveBeenCalled();
        expect(result).toBe(taskResult);
    });

    test('should process multiple tasks', async () => {
        const results: string[] = [];
        const createTask = (value: string) => async () => {
            results.push(value);
            return value;
        };
        
        const promise1 = queueManager.add(createTask('task1'));
        const promise2 = queueManager.add(createTask('task2'));
        
        await Promise.all([promise1, promise2]);
        
        expect(results).toContain('task1');
        expect(results).toContain('task2');
    });

    test('should limit concurrent tasks', async () => {
        let running = 0;
        let maxRunning = 0;
        
        const createTask = () => async () => {
            running++;
            maxRunning = Math.max(maxRunning, running);
            
            await new Promise(resolve => setTimeout(resolve, 50));
            
            running--;
            return 'done';
        };
        
        // Start 5 tasks
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(queueManager.add(createTask()));
        }
        
        await Promise.all(promises);
        
        // Since concurrency is 2, should never have more than 2 running
        expect(maxRunning).toBe(2);
    });
});