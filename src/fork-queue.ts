import { fork, ChildProcess } from "child_process";

type ForkArgs = Parameters<typeof fork>;

export class ForkQueue {
  #maxLength = 10;

  #watingQueue: {
    forkArgs: ForkArgs;
    resolve: (value: ChildProcess | PromiseLike<ChildProcess>) => void;
    reject: (reason: any) => void;
  }[] = [];

  #processQueue: ChildProcess[] = new Proxy([] as ChildProcess[], {
    // arrow function to bind this
    set: (array, prop, value) => {
      // When change length, threre might be a place for new process to launch
      if (
        prop === "length" &&
        value < this.#maxLength &&
        this.#watingQueue.length !== 0
      ) {
        const preapreItem = this.#watingQueue.pop();
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

      // default behavior
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
    // if the queue is full push fork request to wating queue
    return new Promise((resolve, reject) => {
      this.#watingQueue.push({
        resolve,
        reject,
        forkArgs,
      });
    });
  }
}

const removeProcessFromQueue = (
  queue: ChildProcess[],
  process: ChildProcess
) => {
  const index = queue.findIndex((p) => p === process);
  if (index !== -1) {
    queue.splice(index, 1);
  }
};
