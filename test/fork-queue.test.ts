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
  forkQueue
    .fork(path.join(__dirname, "./worker.js"), ["onework"])
    .then((cp) => {
      cp.stdout?.pipe(process.stdout);
      cp.on("exit", done);
    });
});

test("fork more", (done) => {
  jest.setTimeout(30000);
  Promise.all(
    new Array(20).fill(0b0).map((_, index) => {
      return new Promise((resolve) => {
        forkQueue
          .fork(path.join(__dirname, "./worker.js"), [index.toString()])
          .then((cp) => {
            cp.on("exit", resolve);
          });
      });
    })
  ).then(() => {
    done();
  });
});

test("fork node error", (done) => {
  let errorList = 0;
  Promise.all(
    new Array(20).fill(0b0).map((_, index) => {
      return new Promise((resolve) => {
        forkQueue
          .fork(path.join(__dirname, "./error.js"), [index.toString()], {
            silent: true,
          })
          .then((cp) => {
            // capture error message from cp.stderr
            // cp.stderr?.pipe(process.stderr)
            cp.on("exit", (code) => {
              // code 1 is error ending
              if (code === 1) {
                errorList += 1;
              }
              resolve(null);
            });
          });
      });
    })
  ).then(() => {
    expect(errorList).toEqual(20);
    done();
  });
});

afterAll(() => {
  console.log(forkQueue);
});
