pragma solidity ^0.4.11;
import "./LowestUniqueNumberGame.sol";

contract TestHelpers is LowestUniqueNumberGame{
    function skipRound(){
        LowestUniqueNumberGame.startNewRound();
    }

    function skipRounds(uint n){
        for(n; n > 0; n-=1){
            LowestUniqueNumberGame.startNewRound();
        }
    }

    function instantExpireRound(uint roundID){
        LowestUniqueNumberGame.roundList[roundID].startTime -= 33 days;
    }
}
