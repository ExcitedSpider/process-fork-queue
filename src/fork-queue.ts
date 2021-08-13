import { fork, ChildProcess } from "child_process";

type ForkArgs = Parameters<typeof fork>;

export class ForkQueue {
  maxLength = 10;

  prepareQueue: {
    forkArgs: ForkArgs;
    resolve: (value: ChildProcess | PromiseLike<ChildProcess>) => void;
    reject: (reason: any) => void;
  }[] = [];

  processQueue: ChildProcess[] = new Proxy([], {
    set(obj, prop, value) {
      console.log("set", obj, "'s ", prop, "as", value);
      return true;
    },
  });

  constructor(length?: number) {
    if (length) {
      this.maxLength = length;
    }
  }

  fork(forkArgs: ForkArgs):Promise<ChildProcess> {
    if (this.processQueue.length < this.maxLength) {
      const process = fork(...forkArgs);
      const removeProcessFromQueue = () => {
        const index = this.processQueue.findIndex((p) => p === process);
        if (index !== -1) {
          this.processQueue.splice(index, 1);
        }
      };
      process.on("exit", removeProcessFromQueue);
      this.processQueue.push(process);
      return Promise.resolve(process);
    }
    return new Promise((resolve, reject) => {
      this.prepareQueue.push({
        resolve,
        reject,
        forkArgs,
      });
    });
  }
}
