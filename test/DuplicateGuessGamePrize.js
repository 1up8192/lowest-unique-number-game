var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("winner should recieve correct prize", function(){
    var th;
    var number1 = 1;
    var number2 = 2;
    var number3 = 3;
    var numberPrice;
    var hash1_1;
    var hash1_2;
    var hash2;
    var hash3;
    var prizeExpected;
    var actualPrize;
    var prizeCarryPercent;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number1, "password", accounts[0]);
    }).then(function(_hash){
      hash1_1 = _hash;
      return th.hashNumber.call(number1, "password", accounts[1]);
    }).then(function(_hash){
      hash1_2 = _hash;
      return th.hashNumber.call(number2, "password", accounts[2]);
    }).then(function(_hash){
      hash2 = _hash;
      return th.hashNumber.call(number3, "password", accounts[3]);
    }).then(function(_hash){
      hash3 = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash1_1, {from: accounts[0], value: numberPrice * number1});
    }).then(function(){
      return th.submitSecretNumber(hash1_2, {from: accounts[1], value: numberPrice * number1});
    }).then(function(){
      return th.submitSecretNumber(hash2, {from: accounts[2], value: numberPrice * number2});
    }).then(function(){
      return th.submitSecretNumber(hash3, {from: accounts[3], value: numberPrice * number3});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.uncoverNumber(1, "password", {from: accounts[0]});
    }).then(function(){
      return th.uncoverNumber(1, "password", {from: accounts[1]});
    }).then(function(){
      return th.uncoverNumber(2, "password", {from: accounts[2]});
    }).then(function(){
      return th.uncoverNumber(3, "password", {from: accounts[3]});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.getPrizeCarryPercent.call();
    }).then(function(_prizeCarryPercent){
      prizeCarryPercent = _prizeCarryPercent;
      return th.getEdgePercent.call();
    }).then(function(edgePercent){
      prizeExpected = (number1*2 + number2 + number3) * numberPrice / 100 * (100 - edgePercent - prizeCarryPercent);
      return th.claimPrize(0, {from: accounts[2]});
    }).then(function(result){
      actualPrize = result.logs[0].args.prize.toNumber()
      assert.equal(actualPrize, prizeExpected, "prize should be as calculated")
    });

  });
});
