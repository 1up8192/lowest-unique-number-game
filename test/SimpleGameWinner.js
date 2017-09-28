var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("smaller guess should win", function(){
    var th;
    var number1 = 1;
    var number2 = 2;
    var numberPrice;
    var hash1;
    var hash2;
    var numberOfRounds;
    var address;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number1, "password", {from: accounts[0]});
    }).then(function(_hash){
      hash1 = _hash;
      return th.hashNumber.call(number2, "password", {from: accounts[1]});
    }).then(function(_hash){
      hash2 = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash1, {from: accounts[0], value: numberPrice * number1});
    }).then(function(_numberPrice){
      return th.submitSecretNumber(hash2, {from: accounts[1], value: numberPrice * number2});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.uncoverNumber(1, "password", {from: accounts[0]});
    }).then(function(){
      return th.uncoverNumber(2, "password", {from: accounts[1]});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.getWinner.call(0);
    }).then(function(winnerAddress){
      assert.equal(winnerAddress, accounts[0], "first player (acc0) should be the winner");

    });

  });
});
