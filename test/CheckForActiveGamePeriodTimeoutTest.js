var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("should be inactive after timeout", function(){
    var th;
    var number = 1;
    var numberPrice;
    var hash;
    var numberOfRounds;
    var address;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(1, "password");
    }).then(function(_hash){
      hash = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number});
    }).then(function(){
      return timeTravel.secondsForward(60*60*24 + 60); //a day and a little later
    }).then(function(){
      return th.checkForActiveGamePeriod.call();
    }).then(function(result){
      assert.equal(result, true, "should be false after timeout");
    });
  });
});
