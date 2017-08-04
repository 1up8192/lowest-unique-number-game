var blockTime;

function detectBlocktime(){
  if(blocktime == null){
    blockTime = web3.eth.getBlock(1).timestamp - web3.eth.getBlock(1).timestamp;
    if(blockTime <= 0){
      throw "blocktime is zero, you have to start TestRPC with scpecified blocktime e.g 'testrpc -b 1'";
    }
  }
}

function secondsForward(seconds){
  detectBlocktime()
  web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [seconds], id: new Date().getTime()});
}

function blocksForward(blocks){
  detectBlocktime()
  var seconds = blockTime * blocks;
  web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [seconds], id: new Date().getTime()});
}
