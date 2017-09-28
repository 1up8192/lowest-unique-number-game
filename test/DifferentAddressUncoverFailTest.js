var expectThrow = require('../testHelperModules/ExpectThrow.js');
var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("shouldn't uncover, beacause tx from wrong addres", function(){
    var th;
    var number = 1;
    var numberPrice;
    var hash;
    var numberOfRounds;
    var address;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number, "password");
    }).then(function(_hash){
      hash = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return expectThrow.getThrowType( th.uncoverNumber(number, "password", {from: accounts[1]}) );
    }).then(function(result){
      assert.equal(result, "invalidOpcode", "Expected invalidOpcode, got '" + result + "' instead")
    });
  });
});
