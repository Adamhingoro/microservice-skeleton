import { describe , it  } from "mocha";
import { expect } from "chai";

describe('example - sample test', function() {
    it('add', function() {
      let result = 2 + 5;
      expect(result).equal(7);
    }); 
});