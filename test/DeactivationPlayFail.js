var expectThrow = require('../testHelperModules/ExpectThrow.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("should start a new game", function(){
    var th;
    var number = 1;
    var numberPrice;
    var hash;
    var numberOfRounds;
    var address;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.deactivate({from: accounts[0]});
    }).then(function(){
      return th.hashNumber.call(1, "password");
    }).then(function(_hash){
      hash = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return expectThrow.getThrowType( th.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number}) );
    }).then(function(result){
      assert.equal(result, "invalidOpcode", "Expected invalidOpcode, got '" + result + "' instead")
    });
  });
});
