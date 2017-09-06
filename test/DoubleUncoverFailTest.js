var expectThrow = require('../testHelperModules/ExpectThrow.js');
var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("shouldn't uncover second time, and shouldnt cause a problem with the outcome", function(){
    var th;
    var number = 1;
    var numberPrice;
    var hash;
    var numberOfRounds;
    var address;
    var uncoverResult;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number, "password", accounts[0]);
    }).then(function(_hash){
      hash = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return expectThrow.getThrowType( th.uncoverNumber(number, "password", {from: accounts[0]}) );
    }).then(function(){
      return expectThrow.getThrowType( th.uncoverNumber(number, "password", {from: accounts[0]}) );
    }).then(function(_result){
      uncoverResult = _result;
      return th.getWinner.call(0);
    }).then(function(winnerAddress){
      assert.equal(winnerAddress, accounts[0], "first player (acc0) should still lbe the winner");
      assert.equal(uncoverResult, "invalidOpcode", "Expected invalidOpcode, got '" + uncoverResult + "' instead")
    });
  });
});
