pragma solidity ^0.4.11;
import "./SafeMath.sol";

contract LowestUniqueNumberGame {

    address owner;
    uint stash;

    bool deactivated = false;
    Rules rules = Rules({edgePercent: 5, periodLength: 1 days, numberPrice: 0.001 ether});
    Round[] public roundList;
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
        uint startTime;
        address winner;
        uint smallestNumber;
        bool prizeClaimed;
        uint value;
    }

    event prizeClaimed(uint indexed prize);

    function LowestUniqueNumberGame() {
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
        } else if ( roundList[SafeMath.safeSub(roundList.length, 1)].startTime + rules.periodLength >= block.timestamp) {
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
        return Round({startTime: block.timestamp, winner: 0x0, smallestNumber: 0, prizeClaimed: false, value: 0});
        if(ruleUpdateNeeded) updateRules();
    }

    function checkIfPriceWasPayed(uint number, bytes32 hash) internal constant returns (bool){
        uint cost = number * rules.numberPrice;
        if( roundList[SafeMath.safeSub(roundList.length, 2)].payments[hash] < cost) return false;
        else return true;
    }

    function payBackDifference(uint number, bytes32 hash) internal returns (bool){
        uint cost = number * rules.numberPrice;
        Round roundToPayBack = roundList[SafeMath.safeSub(roundList.length, 2)];
        uint payment = roundToPayBack.payments[hash];
        require(payment >= cost);
        uint difference = payment - cost;
        msg.sender.transfer(difference);
        roundToPayBack.payments[hash] = cost;
        roundToPayBack.value -= difference;
    }

    function startNewRound() internal{
        roundList.push(newRound());
    }

    function submitSecretNumber(bytes32 hash) payable onlyActive{
        if (!checkForActiveGamePeriod()) {
            startNewRound();
        }
        Round activeRound = roundList[SafeMath.safeSub(roundList.length, 1)];
        require(msg.value >= rules.numberPrice);
        activeRound.secretNumbers[hash] = msg.sender;
        activeRound.payments[hash] = msg.value;
    }

    function uncoverNumber(uint number, string password) onlyActive{
        if (!checkForActiveGamePeriod()) {
            startNewRound();
        }
        bytes32 hash = hashNumber(number, password);
        Round roundToUncover = roundList[SafeMath.safeSub(roundList.length, 2)];
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

    function checkIfClaimable(uint roundID) constant returns (bool){
      bool result = (roundID != SafeMath.safeSub(roundList.length, 1) && /*it can not be the most recent round*/
      (roundID != SafeMath.safeSub(roundList.length, 2) || !checkForActiveGamePeriod()) ); /*it can only be the second recent round if there is no active game in the first round*/
      return result;
    }

    function claimPrize(uint roundID) {
        require(checkIfClaimable(roundID));
        require(!roundList[roundID].prizeClaimed);
        require(msg.sender == roundList[roundID].winner);
        uint fullValue = roundList[roundID].value;
        uint edge = fullValue / 100 * rules.edgePercent;
        uint prize = fullValue - edge;
        stash += edge;
        msg.sender.transfer(prize);
        prizeClaimed(prize);
        roundList[roundID].prizeClaimed = true;

    }

    function finalPayout(uint roundID, bytes32 hash) {
        require(deactivated);
        require(roundID == SafeMath.safeSub(roundList.length, 1) || roundID == SafeMath.safeSub(roundList.length, 2)); // only last two rounds, older rounds have only prizes for the winners
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

    function getWinner(uint roundID) constant returns (address){
        return roundList[roundID].winner;
    }

    function getEdgePercent() constant returns (uint) {
        LowestUniqueNumberGame.checkForActiveGamePeriod();
        return rules.edgePercent;
    }

    function getPeriodLength() constant returns (uint) {
        return rules.periodLength;
    }

    function getNumberPrice() constant returns (uint) {
        return rules.numberPrice;
    }

    function getNumberOfRounds() constant returns (uint) {
        return roundList.length;
    }

    function getSenderByRoundIDAndHash(uint roundID, bytes32 hash) constant returns (address){
        return roundList[roundID].secretNumbers[hash];
    }

}
