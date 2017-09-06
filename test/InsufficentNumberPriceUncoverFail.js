var expectThrow = require('../testHelperModules/ExpectThrow.js');
var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("shouldn't uncover, beacause not enough number price was paid", function(){
    var th;
    var number = 10;
    var numberPrice;
    var hash;
    var numberOfRounds;
    var address;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number, "password", accounts[0]);
    }).then(function(_hash){
      hash = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash, {from: accounts[0], value: (numberPrice * number)/2 }); //paying only half price
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return expectThrow.getThrowType( th.uncoverNumber(number, "password", {from: accounts[0]}) );
    }).then(function(result){
      assert.equal(result, "invalidOpcode", "Expected invalidOpcode, got '" + result + "' instead")
    });
  });
});
