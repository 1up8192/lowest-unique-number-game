pragma solidity ^0.4.11;
import "./LowestUniqueNumberGame.sol";

contract TestHelpers is LowestUniqueNumberGame{

    function getWinner(uint roundID) constant returns (address){
        return LowestUniqueNumberGame.roundList[roundID].winner;
    }

    function getPrizeCarryPercent() constant returns (uint) {
        return LowestUniqueNumberGame.rules.prizeCarryPercent;
    }

    function getEdgePercent() constant returns (uint) {
        return LowestUniqueNumberGame.rules.edgePercent;
    }

    function getPeriodLength() constant returns (uint) {
        return LowestUniqueNumberGame.rules.periodLength;
    }

    function getPrizeExpiration() constant returns (uint) {
        return LowestUniqueNumberGame.rules.prizeExpiration;
    }

    function getNumberPrice() constant returns (uint) {
        return LowestUniqueNumberGame.rules.numberPrice;
    }

    function getNumberOfRounds() constant returns (uint) {
        return LowestUniqueNumberGame.roundList.length;
    }

    function getSenderByRoundIDAndHash(uint roundID, bytes32 hash) constant returns (address){
        return LowestUniqueNumberGame.roundList[roundID].secretNumberAddresses[hash];
    }

    function getRoundValue(uint roundID) constant returns (uint){
        return LowestUniqueNumberGame.roundList[roundID].value;
    }

    function skipRound(){
        LowestUniqueNumberGame.startNewRound();
    }

    function skipRounds(uint n){
        for(n; n > 0; n-=1){
            LowestUniqueNumberGame.startNewRound();
        }
    }
}
