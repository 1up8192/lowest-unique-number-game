var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("final refound should be payed correctly", function(){
    var th;
    var number1 = 1;
    var numberPrice;
    var hash1;
    var hash2;
    var fundsExpected;
    var actualFinalRefund;
    var prizeCarryPercent;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number1, "password", accounts[1]);
    }).then(function(_hash){
      hash1 = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      fundsExpected = number1 * numberPrice;
      return th.submitSecretNumber(hash1, {from: accounts[1], value: numberPrice * number1});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return th.deactivate({from: accounts[0]});
    }).then(function(){
      return th.finalPayout(0, hash1, {from: accounts[1]});
    }).then(function(result){
      actualFinalRefund = result.logs[0].args.refund.toNumber();
       assert.equal(actualFinalRefund, fundsExpected, "wrong final refound")

    });
  });
});
