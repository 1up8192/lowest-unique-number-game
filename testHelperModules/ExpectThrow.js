//from: https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/test/helpers/expectThrow.js

var expectThrow = {
  getThrowType: function(promise){
    return promise.then(function(){
      return false;
    }).catch (function(error) {
      // TODO: Check jump destination to destinguish between a throw
      //       and an actual invalid jump.
      const invalidOpcode = error.message.search('invalid opcode') >= 0;
      // TODO: When we contract A calls contract B, and B throws, instead
      //       of an 'invalid jump', we get an 'out of gas' error. How do
      //       we distinguish this from an actual out of gas event? (The
      //       testrpc log actually show an 'invalid jump' event.)
      const outOfGas = error.message.search('out of gas') >= 0;
      if(invalidOpcode) return "invalidOpcode";
      if(outOfGas) return "outOfGas";
      return error;
    });
  }
};

module.exports = expectThrow;
