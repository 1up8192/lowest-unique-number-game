var SafeMath = artifacts.require("./SafeMath.sol");
var LowestUniqueNumberGame = artifacts.require("./LowestUniqueNumberGame.sol");
var TestHelpers = artifacts.require("./TestHelpers.sol")

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, LowestUniqueNumberGame);
  deployer.deploy(LowestUniqueNumberGame);
  deployer.link(LowestUniqueNumberGame, TestHelpers);
  deployer.deploy(TestHelpers);
};
