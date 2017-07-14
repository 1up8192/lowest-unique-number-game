pragma solidity ^0.4.13;

contract LowestUniqeNumberGame{
    
    address owner;
    uint stash;
    
    bool deactivated = false;
    Rules rules = Rules({edgePercent: 5, periodLength: 5000, /*slightly less than a day*/ numberPrice: 0.001 ether});
    Round[] roundList;
    Rules newRules = rules;
    bool ruleUpdateNeeded = false;
    
    struct Rules{
        uint edgePercent;
        uint periodLength;
        uint numberPrice;
    }
    
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
        } else if (roundList[roundList.length-1].startBlock + rules.periodLength >= block.number) {
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
        return Round({startBlock: block.number, winner: 0x0, smallestNumber: 0, prizeClaimed: false, value: 0});
        if(ruleUpdateNeeded) updateRules();
    }    
    
    function checkIfPriceWasPayed(uint number, bytes32 hash) internal constant returns (bool){
        uint cost = number * rules.numberPrice;
        if(roundList[roundList.length-2].payments[hash] < cost) return false;
        else return true;
    }
    
    function payBackDifference(uint number, bytes32 hash) internal returns (bool){
        uint cost = number * rules.numberPrice;
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
        require(msg.value >= rules.numberPrice);
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
            if(roundToUncover.smallestNumber > number || roundToUncover.smallestNumber == 0) {
                roundToUncover.smallestNumber = number;
                roundToUncover.winner = msg.sender;
            }
        }
    }
    
    function claimPrize(uint roundID) {
        require(roundID != roundList.length-1 && roundID != roundList.length-2); //the two newest rounds are excluded
        require(!roundList[roundID].prizeClaimed);
        require(msg.sender == roundList[roundID].winner);
        uint fullValue = roundList[roundID].value;
        uint edge = fullValue / 100 * rules.edgePercent;
        uint prize = fullValue - edge;
        stash += edge;
        msg.sender.transfer(prize);
        roundList[roundID].prizeClaimed = true;
        
    }
    
    function finalPayout(uint roundID, bytes32 hash) {
        require(deactivated);
        require(roundID == roundList.length-1 || roundID == roundList.length-2); // only last two rounds, older rounds have only prizes for the winners
        require(roundList[roundID].secretNumbers[hash] == msg.sender);
        msg.sender.transfer(roundList[roundID].payments[hash]);
        roundList[roundID].payments[hash]=0;
    }
    
    function cashOut(uint amount) onlyOwner{
        uint actualAmount;
        if(amount == 0 || amount > stash){
            actualAmount = stash; 
        } else {
            actualAmount = amount;
        }
        owner.transfer(actualAmount);
    }
    
    function setEdgePercent(uint newEdgePercent) onlyOwner {
        newRules.edgePercent = newEdgePercent;
        ruleUpdateNeeded = true;
    }
    
    function setPeriodLength(uint newPeriodLength) onlyOwner {
        newRules.periodLength = newPeriodLength;
        ruleUpdateNeeded = true;
    }
    
    function setNumberPrice(uint newNumberPrice) onlyOwner {
        newRules.numberPrice = newNumberPrice;
        ruleUpdateNeeded = true;
    }
    
    function updateRules() internal{
        rules = newRules;
        ruleUpdateNeeded = false;
    }
    
}
