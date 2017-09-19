var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("prize should be correctly recycled (also carry)", function(){
    var th;
    var number1 = 1;
    var number2 = 2;
    var numberPrice;
    var hash1;
    var hash2;
    var prizeExpected;
    var actualPrize;
    var prizeCarryPercent;
    var expiration;
    var carry;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number1, "password", accounts[0]);
    }).then(function(_hash){
      hash1 = _hash;
      return th.hashNumber.call(number2, "password", accounts[1]);
    }).then(function(_hash){
      hash2 = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.getPrizeExpiration.call();
    }).then(function(_expiration){
      expiration = _expiration.toNumber();
      console.log(expiration);
      return th.submitSecretNumber(hash1, {from: accounts[0], value: numberPrice * number1});
    }).then(function(){
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
      return th.instantExpireRound(0);
      //return timeTravel.secondsForward(expiration + 60*60*24); //several days and a little later
    }).then(function(){
      return th.getPrizeCarryPercent.call();
    }).then(function(_prizeCarryPercent){
      prizeCarryPercent = _prizeCarryPercent;
      return th.getEdgePercent.call();
    }).then(function(edgePercent){
      prizeExpected = (number1 + number2) * numberPrice / 100 * (100 - edgePercent - prizeCarryPercent);
      carry = (number1 + number2) * numberPrice / 100 *  prizeCarryPercent;
      return th.recyclePrize(0);
    }).then(function(){
      return th.getRoundValue.call(2);
    }).then(function(result){
      //assert(true, "recycled prize (+carry prize) should be in the newest round ");
      assert.equal(result , prizeExpected / 2 + carry, "recycled prize (+carry prize) should be in the newest round ");
    });
  });
});
