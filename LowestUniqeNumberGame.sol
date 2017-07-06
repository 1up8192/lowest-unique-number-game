pragma solidity ^0.4.11;

contract LowestUniqeNumberGame{
    address owner;
    
    bool isActive = true;
    uint profitPercent = 5;
    uint periodLegth = 5000; //slightly less than a day
    uint numberPrice = 0.001 ether;
    Round[] roundList;
    
    struct Round{
        mapping(bytes32=>address) secretNumbers;
        mapping(bytes32=>uint) payments;
        mapping(uint=>bool) numbersPlayed;
        uint startBlock;
        address winner;
        uint smallestNumber;
        bool prizeClaimed;
        uint value;
    }
    
    function checkForActiveGamePeriod() constant returns (bool){
        bool result;
        if (roundList.length == 0) 
        {
            result = false;
        } else if (roundList[roundList.length-1].startBlock + periodLegth >= now) {
            result = true;
        } else {
            result = false;
        }
        return result;
    }
    
    function hashNumber(uint number, string password) constant returns (bytes32){
        if(number == 0) throw;
        return sha3(number, password);
    }
    
    function newRound() internal constant returns (Round){
        return Round(block.number, 0x0, 0, false, 0);
    }    
    
    function checkIfPriceWasPayed(uint number, bytes32 hash) internal constant returns (bool){
        uint cost = number * numberPrice;
        if(roundList[roundList.length-2].payments[hash] < cost) return false;
        else return true;
    }
    
    function payBackDifference(uint number, bytes32 hash) internal returns (bool){
         uint cost = number * numberPrice;
         uint payment = roundList[roundList.length-2].payments[hash];
         if(payment < cost) throw;
         uint difference = payment - cost;
         if(!msg.sender.send(difference)) throw;
         delete roundList[roundList.length-2].payments[hash];
         roundList[roundList.length-2].value -= difference;
    }
    
    function startNewRound() {
        roundList.push(newRound());
    }
    
    function submitSecretNumber(bytes32 hash) payable {
        if (!checkForActiveGamePeriod()) {
            startNewRound();
        }
        Round activeRound = roundList[roundList.length-1];
        if(msg.value < numberPrice) throw;
        activeRound.secretNumbers[hash] = msg.sender;
        activeRound.payments[hash] = msg.value;
    }
    
    function uncoverNumber(bytes32 hash, uint number, string password) {
        if (!checkForActiveGamePeriod()) {
            startNewRound();
        }
        Round roundToUncover = roundList[roundList.length-2];
        if(roundToUncover.secretNumbers[hash] != msg.sender) throw;
        if(hash != hashNumber(number, password)) throw;
        if(!checkIfPriceWasPayed(number, hash)) throw;
        payBackDifference(number, hash);
        if(roundToUncover.numbersPlayed[number] == false) {
            roundToUncover.numbersPlayed[number] = true;
            if(roundToUncover.smallestNumber > number) {
                roundToUncover.smallestNumber = number;
                roundToUncover.winner = msg.sender;
            }
        }
    }
    
    function claimPrize(uint roundID) {
        if(roundID + 2 > roundList.length) throw;
        if(roundList[roundID].prizeClaimed) throw;
        
    }
}
