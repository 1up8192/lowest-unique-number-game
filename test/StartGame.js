var LowestUniqueNumberGame = artifacts.require("LowestUniqueNumberGame");
var TestHelpers = artifacts.require("TestHelpers");

contract( "start game test", function(accounts) {
  it("should start a new game", function(){
    var lung;
    var testHelpers;
    var number = 1;
    var numberPrice;
    var hash;
    var numberOfRounds;
    var address;
    return LowestUniqueNumberGame.deployed().then(function(instance){
      lung = instance;
      return TestHelpers.deployed();
    }).then(function(helperInstance){
      testHelpers = helperInstance;
      return lung.hashNumber.call(1, "password");
    }).then(function(_hash){
      hash = _hash;
      return lung.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return lung.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number});
    }).then(function(){
      return lung.getNumberOfRounds.call();
      /*assert.equal(1, 1, "okay");*/
    }).then(function(_numberOfRounds){
      numberOfRounds = _numberOfRounds.toNumber();
      return lung.getSenderByRoundIDAndHash.call(0, hash);
    }).then(function(_address){
      address = _address;

      assert.equal(numberOfRounds, 1, "numberOfRounds wasnt 1");
      assert.equal(address, accounts[0], "guess with given address wasnt found");
    });
  });
});
