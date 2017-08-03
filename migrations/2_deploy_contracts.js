var SafeMath = artifacts.require("./SafeMath.sol");
var LowestUniqeNumberGame = artifacts.require("./LowestUniqeNumberGame.sol");
var TestHelpers = artifacts.require("./TestHelpers.sol")

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, LowestUniqeNumberGame);
  deployer.deploy(LowestUniqeNumberGame);
  deployer.link(LowestUniqeNumberGame, TestHelpers);
  deployer.deploy(TestHelpers);
};
