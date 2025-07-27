interface QueueOptions {
  concurrency: number;
}

type QueueTask<T> = () => Promise<T>;

export class QueueManager {
  private concurrency: number;
  private running: number = 0;
  private queue: Array<{
    task: QueueTask<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(options: QueueOptions) {
    this.concurrency = options.concurrency;
  }

  add<T>(task: QueueTask<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject,
      });

      this.processQueue();
    });
  }

  private processQueue() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const { task, resolve, reject } = this.queue.shift()!;
    this.running++;

    Promise.resolve()
      .then(() => task())
      .then(
        (result) => {
          this.running--;
          resolve(result);
          this.processQueue();
        },
        (error) => {
          this.running--;
          reject(error);
          this.processQueue();
        }
      );
  }
}