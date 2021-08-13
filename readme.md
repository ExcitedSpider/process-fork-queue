# Process Fork Queue

Make limited amount of node process forks.

## Get Start

```bash
npm i process-fork-queue
```

```js
// make a queue that limit max concurrent nodejs child process as 10
queue = new ForkQueue(10);

for (let i = 0; i < 100; i++) {
  queue
    .fork("./path-to-worker.js", ["--some-args", i], { silent: true })
    .then((childprocess) => {
      childprocess.on("message", console.log);
    });
}
```

## API

- `new ForkQueue(maxConcurrent?: number)`

  Construct a process fork queue.

  - maxConcurrent: max concurrent child process at one time. Default to 10

- `queue.fork(modulePath: string, args?: ReadonlyArray<string>, options?: ForkOptions): Promise<ChildProcess>`

  Make a fork request.

  Receive the same args as NodeJS [`child_process.fork`](https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options). The different is the returns is a promised [`ChildProcess`](https://nodejs.org/api/child_process.html#child_process_class_childprocess).

  If the queue is full, the returned promise is pending to wait existed processes to end.
