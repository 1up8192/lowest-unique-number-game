var timeTravel = require('../timetravel/TimeTravel.js');
var LowestUniqueNumberGame = artifacts.require("LowestUniqueNumberGame");
var TestHelpers = artifacts.require("TestHelpers");

contract( "simple game prize test", function(accounts) {
  it("winner should recieve correct prize", function(){
    var lung;
    var testHelpers;
    var number1 = 1;
    var number2 = 2;
    var numberPrice;
    var hash1;
    var hash2;
    var numberOfRounds;
    var address;
    var prizeExpected;
    var balanceBefore;
    var balanceAfter;
    var gasUsed;
    var gasPrice;
    var gain;
    var actualPrize;
    return LowestUniqueNumberGame.deployed().then(function(instance){
      lung = instance;
      return TestHelpers.deployed();
    }).then(function(helperInstance){
      testHelpers = helperInstance;
      return lung.hashNumber.call(number1, "password", accounts[0]);
    }).then(function(_hash){
      hash1 = _hash;
      return lung.hashNumber.call(number2, "password", accounts[1]);
    }).then(function(_hash){
      hash2 = _hash;
      return lung.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return lung.submitSecretNumber(hash1, {from: accounts[0], value: numberPrice * number1});
    }).then(function(_numberPrice){
      return lung.submitSecretNumber(hash2, {from: accounts[1], value: numberPrice * number2});
    }).then(function(){
      return timeTravel.secondsForward(60*60*24); //one day later...
    }).then(function(){
      return lung.uncoverNumber(1, "password", {from: accounts[0]});
    }).then(function(){
      return lung.uncoverNumber(2, "password", {from: accounts[1]});
    }).then(function(){
      return timeTravel.secondsForward(60*60*24); //one day later...
    }).then(function(){
      return lung.getEdgePercent.call();
    }).then(function(edgePercent){
      prizeExpected = (number1 + number2) * numberPrice / 100 * (100 - edgePercent);
      return lung.getRoundValue.call(0);
    }).then(function(roundValue){
      return web3.eth.getBalance(accounts[0]);
    }).then(function(_balanceBefore){
      balanceBefore = _balanceBefore;
      return lung.claimPrize(0, {from: accounts[0]});
    }).then(function(result){
      gasUsed = result.receipt.gasUsed;
      gasPrice = web3.eth.gasPrice;
      var executionCost = gasUsed * gasPrice;
      gain = prizeExpected - executionCost;

    }).then(function(){
      return lung.getNumberOfRounds.call();
    }).then(function(roundNumber){
      return web3.eth.getBalance(accounts[0]);
    }).then(function(_balanceAfter){
      balanceAfter = _balanceAfter;
      var difference = balanceAfter.minus(balanceBefore).toNumber();

      var prizeClaimedEvent = lung.prizeClaimed();
      return prizeClaimedEvent.get(function(error, result)
      {
        actualPrize = result[0].args.prize.toNumber();
        return;
       });

      assert.equal(actualPrize, prizeExpected, "prize should be as calculated")
      assert.equal(difference, gain, "account balance should be correct after prize arrived");
    });

  });
});
