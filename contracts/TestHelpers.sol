pragma solidity ^0.4.11;
import "./LowestUniqeNumberGame.sol";

contract TestHelpers is LowestUniqeNumberGame{

    function getEdgePercent() constant returns (uint) {
        LowestUniqeNumberGame.checkForActiveGamePeriod();
        return LowestUniqeNumberGame.rules.edgePercent;
    }

    function getPeriodLength() constant returns (uint) {
        return LowestUniqeNumberGame.rules.periodLength;
    }

    function getNumberPrice() constant returns (uint) {
        return LowestUniqeNumberGame.rules.numberPrice;
    }

    function getNumberOfRounds() constant returns (uint) {
        return LowestUniqeNumberGame.roundList.length;
    }

    function getSenderByRoundIDAndHash(uint roundID, bytes32 hash) constant returns (address){
        return LowestUniqeNumberGame.roundList[roundID].secretNumbers[hash];
    }

    function getWinner(uint roundID) constant returns (address){
        return LowestUniqeNumberGame.roundList[roundID].winner;
    }
}
