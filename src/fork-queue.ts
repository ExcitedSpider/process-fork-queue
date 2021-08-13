import { fork, ChildProcess } from "child_process";

type ForkArgs = Parameters<typeof fork>;

const removeProcessFromQueue = (
  queue: ChildProcess[],
  process: ChildProcess
) => {
  const index = queue.findIndex((p) => p === process);
  if (index !== -1) {
    queue.splice(index, 1);
  }
};

export class ForkQueue {
  #maxLength = 10;

  #prepareQueue: {
    forkArgs: ForkArgs;
    resolve: (value: ChildProcess | PromiseLike<ChildProcess>) => void;
    reject: (reason: any) => void;
  }[] = [];

  #processQueue: ChildProcess[] = new Proxy([] as ChildProcess[], {
    set: (array, prop, value) => {
      if (
        prop === "length" &&
        value < this.#maxLength &&
        this.#prepareQueue.length !== 0
      ) {
        const preapreItem = this.#prepareQueue.pop();
        if (preapreItem) {
          const cp = fork(...preapreItem.forkArgs);
          cp.on(
            "exit",
            removeProcessFromQueue.bind(null, this.#processQueue, cp)
          );

          preapreItem.resolve(cp);
          this.#processQueue.push(cp);
        }
      }
      array[prop as any] = value;
      return true;
    },
  });

  constructor(length?: number) {
    if (length) {
      this.#maxLength = length;
    }
  }

  fork(...forkArgs: ForkArgs): Promise<ChildProcess> {
    if (this.#processQueue.length < this.#maxLength) {
      const process = fork(...forkArgs);
      process.on(
        "exit",
        removeProcessFromQueue.bind(null, this.#processQueue, process)
      );
      this.#processQueue.push(process);
      return Promise.resolve(process);
    }
    return new Promise((resolve, reject) => {
      this.#prepareQueue.push({
        resolve,
        reject,
        forkArgs,
      });
    });
  }
}
