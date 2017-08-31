pragma solidity ^0.4.11;
import "./LowestUniqueNumberGame.sol";

contract TestHelpers is LowestUniqueNumberGame{

    function getWinner(uint roundID) constant returns (address){
        return LowestUniqueNumberGame.roundList[roundID].winner;
    }

    function getEdgePercent() constant returns (uint) {
        LowestUniqueNumberGame.checkForActiveGamePeriod();
        return LowestUniqueNumberGame.rules.edgePercent;
    }

    function getPeriodLength() constant returns (uint) {
        return LowestUniqueNumberGame.rules.periodLength;
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
}
