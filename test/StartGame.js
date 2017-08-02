var LowestUniqeNumberGame = artifacts.require("LowestUniqeNumberGame");

contract( "LowestUniqeNumberGame", function(accounts) {
  it("should start a new game", function(){
    var lung;
    var number = 1;
    var numberPrice;
    var hash;
    return LowestUniqeNumberGame.deployed().then(function(instance){
      lung = instance;
      return lung.hashNumber.call(1, "password");
    }).then(function(_hash){
      hash = _hash;
      return lung.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice;
      return lung.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number});
    }).then(function(){
      
    });

  });
});
