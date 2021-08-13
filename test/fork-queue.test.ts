import path from "path";
import { ForkQueue } from "../src/index";

let forkQueue: ForkQueue;
beforeEach(() => {
  forkQueue = new ForkQueue(10);
});

test("constructor", () => {
  console.log(forkQueue);
  expect(forkQueue).toBeTruthy();
});

test("fork one", (done) => {
  forkQueue.fork(path.join(__dirname, "./worker.js")).then((cp) => {
    cp.stdout?.pipe(process.stdout);
    cp.on("exit", done);
  });
});

test("fork more", (done) => {
  jest.setTimeout(30000);
  Promise.all(
    new Array(30).fill(0b0).map((_, index) => {
      return new Promise((resolve) => {
        forkQueue
          .fork(path.join(__dirname, "./worker.js"), [index.toString()])
          .then((cp) => {
            cp.stdout?.pipe(process.stdout);
            cp.on("exit", resolve);
          });
      });
    })
  ).then(() => {
    done();
  });
});

afterAll(() => {
  console.log(forkQueue);
});
