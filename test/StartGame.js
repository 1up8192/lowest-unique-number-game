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
      return th.hashNumber.call(1, "password");
    }).then(function(_hash){
      hash = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number});
    }).then(function(){
      return th.getNumberOfRounds.call();
      /*assert.equal(1, 1, "okay");*/
    }).then(function(_numberOfRounds){
      numberOfRounds = _numberOfRounds.toNumber();
      return th.getSenderByRoundIDAndHash.call(0, hash);
    }).then(function(_address){
      address = _address;

      assert.equal(numberOfRounds, 1, "numberOfRounds wasnt 1");
      assert.equal(address, accounts[0], "guess with given address wasnt found");
    });
  });
});
