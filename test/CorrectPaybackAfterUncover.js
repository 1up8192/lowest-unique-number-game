var timeTravel = require('../testHelperModules/TimeTravel.js');
var TestHelpers = artifacts.require("TestHelpers");

contract( "TestHelpers", function(accounts) {
  it("winner should recieve correct payback", function(){
    var th;
    var number = 1;
    var numberPrice;
    var hash;
    var excess = 1000000;
    var address;
    var balanceBefore;
    var balanceAfter;
    var expextedGain;
    var actualPayback;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.hashNumber.call(number, "password", accounts[0]);
    }).then(function(_hash){
      hash = _hash;
      return th.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return th.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number + excess});
    }).then(function(){
      return th.skipRound(); //one day later...
    }).then(function(){
      return web3.eth.getBalance(accounts[0]);
    }).then(function(_balanceBefore){
      balanceBefore = _balanceBefore;
      return th.uncoverNumber(number, "password", {from: accounts[0]});
    }).then(function(result){
      actualPayback = result.logs[0].args.value.toNumber();

      var gasUsed = result.receipt.gasUsed;
      var gasPrice = web3.eth.gasPrice;
      var executionCost = gasUsed * gasPrice;
      expextedGain = excess - executionCost;
      return web3.eth.getBalance(accounts[0]);
    }).then(function(_balanceAfter){
      balanceAfter = _balanceAfter;
      var difference = balanceAfter.minus(balanceBefore).toNumber();
      assert.equal(actualPayback, excess, "payback should be as calculated")
      //assert.equal(difference, expextedGain, "account balance should be correct after payback arrived");
    });

  });
});
