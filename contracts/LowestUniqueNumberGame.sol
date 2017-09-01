pragma solidity ^0.4.11;
import "./SafeMath.sol";
import "./MinHeap.sol";

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

    MinHeap.Heap candidatesHeap;

    struct Round{
        mapping(bytes32=>address) secretNumberAddresses;
        mapping(bytes32=>uint) payments;
        mapping(uint=>address[]) numbersUncovered;
        uint startTime;
        address winner;
        uint smallestNumber;
        bool prizeClaimed;
        uint value;
    }

    event prizeClaimed(uint indexed prize);
    event payback(uint indexed prize);

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

    function hashNumber(uint number, string password, address sender) constant returns (bytes32){
        require(number != 0);
        return sha3(number, password, sender);
    }

    function newRound() internal constant returns (Round){
        return Round({startTime: block.timestamp, winner: 0x0, smallestNumber: 0, prizeClaimed: false, value: 0});
        delete candidatesHeap;
        if(ruleUpdateNeeded) updateRules();
    }

    function checkIfPriceWasPayed(uint number, bytes32 hash) internal constant returns (bool){
        uint cost = number * rules.numberPrice;
        if( roundList[SafeMath.safeSub(roundList.length, 2)].payments[hash] < cost) return false;
        else return true;
    }

    function payBackDifference(uint number, bytes32 hash) internal returns (bool){
        uint cost = number * rules.numberPrice;
        Round storage roundToPayBack = roundList[SafeMath.safeSub(roundList.length, 2)];
        uint payment = roundToPayBack.payments[hash];
        require(payment >= cost);
        uint difference = payment - cost;
        msg.sender.transfer(difference);
        payback(difference);
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
        Round storage activeRound = roundList[SafeMath.safeSub(roundList.length, 1)];
        require(msg.value >= rules.numberPrice);
        activeRound.secretNumberAddresses[hash] = msg.sender;
        activeRound.payments[hash] = msg.value;
        activeRound.value += msg.value;
    }

    function uncoverNumber(uint number, string password) onlyActive{
        if (!checkForActiveGamePeriod()) {
            startNewRound();
        }
        bytes32 hash = hashNumber(number, password, msg.sender);
        Round storage roundToUncover = roundList[SafeMath.safeSub(roundList.length, 2)];
        require(roundToUncover.secretNumberAddresses[hash] == msg.sender);
        roundToUncover.secretNumberAddresses[hash] = 0x0; //only uncoverable once, prevents double uncover accidents
        require(checkIfPriceWasPayed(number, hash));
        payBackDifference(number, hash);
        if(roundToUncover.numbersUncovered[number].length == 0) {
            roundToUncover.numbersUncovered[number].push(msg.sender);
            if (number < roundToUncover.smallestNumber || roundToUncover.smallestNumber == 0){
                roundToUncover.smallestNumber = number;
                roundToUncover.winner = msg.sender;
            }
            MinHeap.insert(candidatesHeap, number);
        } else {
            if(roundToUncover.numbersUncovered[number].length == 1){
                MinHeap.removeNumber(candidatesHeap, number);
                if(number == roundToUncover.smallestNumber){
                    if(candidatesHeap.heap.length > 0){
                        roundToUncover.smallestNumber = MinHeap.min(candidatesHeap);
                        roundToUncover.winner = roundToUncover.numbersUncovered[MinHeap.min(candidatesHeap)][0];
                    } else {
                        delete roundToUncover.smallestNumber;
                        delete roundToUncover.winner;
                    }
                }
            }
            roundToUncover.numbersUncovered[number].push(msg.sender);
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

    function pumpUp() payable onlyActive{
        if (!checkForActiveGamePeriod()) {
            startNewRound();
        }
        roundList[SafeMath.safeSub(roundList.length, 1)].value += msg.value;
    }

    function finalPayout(uint roundID, bytes32 hash) {
        require(deactivated);
        require(roundID == SafeMath.safeSub(roundList.length, 1) || roundID == SafeMath.safeSub(roundList.length, 2)); // only last two rounds, older rounds have only prizes for the winners
        require(roundList[roundID].secretNumberAddresses[hash] == msg.sender);
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
