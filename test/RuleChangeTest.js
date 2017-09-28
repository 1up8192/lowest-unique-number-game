var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("number prices should be set after new round", function(){
    var th;
    var number1 = 1;
    var numberPrice;
    var hash1;

    var firstNewPriceExpected = web3.toWei(0.002, "ether");
    var secondNewPriceExpected = web3.toWei(0.003, "ether");
    var firstNewPrice;
    var secondNewPrice;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number1, "password", {from: accounts[1]});
    }).then(function(_hash){
      hash1 = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash1, {from: accounts[1], value: numberPrice * number1});
    }).then(function(){
      return th.setNumberPrice(firstNewPriceExpected, {from: accounts[0]})
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.setNumberPrice(secondNewPriceExpected, {from: accounts[0]})
    }).then(function(){
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      firstNewPrice = _numberPrice.toNumber();
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      secondNewPrice = _numberPrice.toNumber();

      assert.equal(firstNewPrice, firstNewPriceExpected, "price should be as set");
      assert.equal(secondNewPrice, secondNewPriceExpected, "price should be as set");

    });
  });
});
