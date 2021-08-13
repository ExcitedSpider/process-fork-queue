import { ForkQueue } from "../src/index";
import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
// import 'mocha';

describe("Fork Queue", () => {
  it("constructor", () => {
    const result = new ForkQueue(10);
    expect(result).to.be('object')
  });
});
