var timeTravel = require('../testHelpers/TimeTravel.js');

contract("TimeTravel", function(){
  it("should travel forward correct amount of blocks", function(){
    var blocksToJump = 100;
    var initialBlockNumber = web3.eth.blockNumber;
    timeTravel.blocksForward(blocksToJump).then(function(){
      blockNumber = web3.eth.blockNumber;
      assert.equal(blockNumber, initialBlockNumber + blocksToJump, "block number wasn't equal to initial block number + blocks to jump");
    });
  });
});
