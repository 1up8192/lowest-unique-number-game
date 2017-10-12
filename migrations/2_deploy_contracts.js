var SafeMath = artifacts.require("SafeMath");
var MinHeap = artifacts.require("MinHeap");
var LowestUniqueNumberGame = artifacts.require("LowestUniqueNumberGame");
var MinHeapTestHelper = artifacts.require("MinHeapTestHelper");
var TestHelpers = artifacts.require("TestHelpers");

module.exports = function(deployer) {

  deployer.deploy(MinHeap);
  deployer.link(MinHeap, LowestUniqueNumberGame);
  deployer.deploy(LowestUniqueNumberGame);
  //deployer.link(MinHeap, MinHeapTestHelper);
  //deployer.deploy(MinHeapTestHelper);
  //deployer.link(LowestUniqueNumberGame, TestHelpers);
  //deployer.link(MinHeap, TestHelpers);
  //deployer.deploy(TestHelpers);
};
