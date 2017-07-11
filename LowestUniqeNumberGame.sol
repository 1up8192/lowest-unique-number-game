pragma solidity ^0.4.13;

contract LowestUniqeNumberGame{
    address owner;
    
    bool deactivated = false;
    uint edgePercent = 5;
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
    
    function LowestUniqeNumberGame() {
        owner = msg.sender;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    modifier onlyActive {
        require(!deactivated);
        _;
    }
    
    function checkForActiveGamePeriod() constant returns (bool){
        bool result;
        if (roundList.length == 0) 
        {
            result = false;
        } else if (roundList[roundList.length-1].startBlock + periodLegth >= block.number) {
            result = true;
        } else {
            result = false;
        }
        return result;
    }
    
    function hashNumber(uint number, string password) constant returns (bytes32){
        require(number != 0);
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
        require(payment >= cost);
        uint difference = payment - cost;
        msg.sender.transfer(difference);
        roundList[roundList.length-2].payments[hash] = cost;
        roundList[roundList.length-2].value -= difference;
    }
    
    function startNewRound() internal{
        roundList.push(newRound());
    }
    
    function submitSecretNumber(bytes32 hash) payable onlyActive{
        if (!checkForActiveGamePeriod()) {
            startNewRound();
        }
        Round activeRound = roundList[roundList.length-1];
        require(msg.value >= numberPrice);
        activeRound.secretNumbers[hash] = msg.sender;
        activeRound.payments[hash] = msg.value;
    }
    
    function uncoverNumber(bytes32 hash, uint number, string password) onlyActive{
        if (!checkForActiveGamePeriod()) {
            startNewRound();
        }
        Round roundToUncover = roundList[roundList.length-2];
        require(roundToUncover.secretNumbers[hash] == msg.sender);
        require(hash == hashNumber(number, password));
        require(checkIfPriceWasPayed(number, hash));
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
        require(roundID != roundList.length-1 && roundID != roundList.length-2); //the two newest rounds are excluded
        require(!roundList[roundID].prizeClaimed);
        require(msg.sender == roundList[roundID].winner);
        msg.sender.transfer(roundList[roundID].value);
        roundList[roundID].prizeClaimed = true;
        
    }
    
    function finalPayout(uint roundID, bytes32 hash) {
        require(deactivated);
        require(roundID == roundList.length-1 || roundID == roundList.length-2); // only last two rounds, older rounds have only prizes for the winners
        require(roundList[roundID].secretNumbers[hash] == msg.sender);
        msg.sender.transfer(roundList[roundID].payments[hash]);
        roundList[roundID].payments[hash]=0;
    }
    
}
