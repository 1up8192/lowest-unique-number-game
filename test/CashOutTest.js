var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("owner should be able to cash out", function(){
    var th;
    var number1 = 1;
    var numberPrice;
    var hash1;
    var hash2;
    var stashExpected;
    var actualPayout;
    var prizeCarryPercent;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number1, "password", accounts[1]);
    }).then(function(_hash){
      hash1 = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash1, {from: accounts[1], value: numberPrice * number1});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.uncoverNumber(1, "password", {from: accounts[1]});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.getPrizeCarryPercent.call();
    }).then(function(_prizeCarryPercent){
      prizeCarryPercent = _prizeCarryPercent;
      return th.getEdgePercent.call();
    }).then(function(edgePercent){
      stashExpected = number1 * numberPrice / 100 * edgePercent;
      return th.claimPrize(0, {from: accounts[1]});
    }).then(function(){
      return th.cashOut(0, {from: accounts[0]});
    }).then(function(result){
      actualPayout = result.logs[0].args.payout.toNumber()
      assert.equal(actualPayout, stashExpected, "stash payout should be as calculated")
    });
  });
});
