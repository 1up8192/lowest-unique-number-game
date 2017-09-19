var expectThrow = require('../testHelperModules/ExpectThrow.js');
var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("final refound should not be payed second time", function(){
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
      return expectThrow.getThrowType( th.finalPayout(0, hash1, {from: accounts[1]}) );
    }).then(function(result){
      assert.equal(result, "invalidOpcode", "Expected invalidOpcode, got '" + result + "' instead")
    });
  });
});
