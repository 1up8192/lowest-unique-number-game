import '../testHelpers/TimeTravel.js'

contract("TimeTravel", function(){
  it("should travel forward correct amount of blocks", function(){
    var blocksToJump = 100;
    return web3.eth.blockNumber;
    var initialBlockNumber;
  }).then(function(blockNumber){
    initialBlockNumber = blockNumber;
    blocksForward(blocksToJump);
  }).then(function(){
    return web3.eth.blockNumber;
  }).then(function(blockNumber){
    assert.equal(blockNumber, initialBlockNumber + blocksToJump, "block number wasn't equal to initial block number + blocks to jump");
  });
});
