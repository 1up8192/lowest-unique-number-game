var SafeMath = artifacts.require("SafeMath");
var LowestUniqueNumberGame = artifacts.require("LowestUniqueNumberGame");
var TestHelpers = artifacts.require("TestHelpers")

module.exports = function(deployer) {
  //deployer.deploy(SafeMath);
  //deployer.link(SafeMath, LowestUniqueNumberGame);
  deployer.deploy(LowestUniqueNumberGame);
  //deployer.link(LowestUniqueNumberGame, TestHelpers);
  deployer.deploy(TestHelpers);
};
