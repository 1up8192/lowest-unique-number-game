var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("portion of the prize should be carried to active round", function(){
    var th;
    var number1 = 1;
    var numberPrice;
    var hash1;
    var prizeCarryPercent;
    var carryExpected;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number1, "password", accounts[0]);
    }).then(function(_hash){
      hash1 = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash1, {from: accounts[0], value: numberPrice * number1});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.uncoverNumber(number1, "password", {from: accounts[0]});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.getPrizeCarryPercent.call();
    }).then(function(_prizeCarryPercent){
      prizeCarryPercent = _prizeCarryPercent;
      return th.getEdgePercent.call();
    }).then(function(edgePercent){
      carryExpected = number1  * numberPrice / 100 *  prizeCarryPercent;
      return th.getRoundValue.call(2);
    }).then(function(result){
      assert.equal(result, carryExpected, "prize carry should be as calculated")
    });
  });
});
