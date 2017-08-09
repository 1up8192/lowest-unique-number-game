var timeTravel = require('../testHelpers/TimeTravel.js');
var LowestUniqueNumberGame = artifacts.require("LowestUniqueNumberGame");
var TestHelpers = artifacts.require("LowestUniqueNumberGame");

contract( "LowestUniqueNumberGame", function(accounts) {
  it("smaller guess should win", function(){
    var lung;
    var testHelpers;
    var number1 = 1;
    var number2 = 2;
    var numberPrice;
    var hash1;
    var hash2;
    var numberOfRounds;
    var address;
    return LowestUniqueNumberGame.deployed().then(function(instance){
      lung = instance;
      return TestHelpers.deployed();
    }).then(function(helperInstance){
      testHelpers = helperInstance;
      return lung.hashNumber.call(number1, "password");
    }).then(function(_hash){
      hash1 = _hash;
      return lung.hashNumber.call(number2, "password");
    }).then(function(_hash){
      hash2 = _hash;
      return testHelpers.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return lung.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number1});
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return lung.submitSecretNumber(hash, {from: accounts[1], value: numberPrice * number2});
    }).then(function(){
      return timeTravel.secondsForward(60*60*24); //one day later...
    }).then(function(){
      return lung.uncoverNumber(1, "password", {from: accounts[0]});
    }).then(function(){
      return lung.uncoverNumber(2, "password", {from: accounts[1]});
    }).then(function(){
      return timeTravel.secondsForward(60*60*24); //one day later...
    }).then(function(){
      return TestHelpers.getWinner(0);
    }).then(function(winnerAddress){
      assert.equal(winnerAddress, accounts[0], "first player (acc0) should be the winner");

    });

  });
});
