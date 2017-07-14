var SafeMath = artifacts.require("./SafeMath.sol");
var LowestUniqeNumberGame = artifacts.require("./LowestUniqeNumberGame.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, LowestUniqeNumberGame);
  deployer.deploy(LowestUniqeNumberGame);
};
