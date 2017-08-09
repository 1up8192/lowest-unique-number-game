var blockTime;

function detectBlocktime(){
	  if(blockTime == null){
	    blockTime = web3.eth.getBlock(1).timestamp - web3.eth.getBlock(0).timestamp;
	    if(blockTime <= 0){
	      throw "blocktime is zero, you have to start TestRPC with scpecified blocktime e.g 'testrpc -b 1'";
	    }
	  }
	}

var timeTravel = {
	secondsForward: function(seconds){
	  detectBlocktime()
	  web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [seconds], id: new Date().getTime()});
	},

module.exports = timeTravel;
