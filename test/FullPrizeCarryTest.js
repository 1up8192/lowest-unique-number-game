var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("if there was no winner, prize should be carried to active round", function(){
    var th;
    var number1 = 1;
    var numberPrice;
    var hash1;
    var valueExpected;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number1, "password");
    }).then(function(_hash){
      hash1 = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash1, {from: accounts[0], value: numberPrice * number1});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      valueExpected = number1  * numberPrice;
      return th.getRoundValue.call(2);
    }).then(function(result){
      assert.equal(result, valueExpected, "prize carry should be as calculated")
    });
  });
});
