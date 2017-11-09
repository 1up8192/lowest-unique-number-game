pragma solidity ^0.4.11;
import "./SafeMath.sol";
import "./MinHeap.sol";

contract LowestUniqueNumberGame {

    address internal owner;
    uint internal stash;
    bool internal deactivated = false;
    uint internal deactivationTime;
    Rules internal rules = Rules({prizeCarryPercent: 10, edgePercent: 0, periodLength: 1 days, numberPrice: 0.001 ether, prizeExpiration: 30 days, expirationEdgePercent: 0});
    Round[] internal roundList;
    Rules internal newRules = rules;
    bool internal ruleUpdateNeeded = false;

    struct Rules{
        uint prizeCarryPercent;
        uint edgePercent;
        uint periodLength;
        uint numberPrice;
        uint prizeExpiration;
        uint expirationEdgePercent;

    }

    MinHeap.Heap internal candidatesHeap;

    struct Round{
        mapping(bytes32=>address) secretNumberAddresses;
        mapping(bytes32=>uint) payments;
        mapping(uint=>address[]) numbersUncovered;
        uint startTime;
        address winner;
        uint smallestNumber;
        uint numberOfGuesses;
        uint[] numbersUncoveredUnsorted;
        bool prizeClaimed;
        uint value;
    }

    event prizeClaimed(uint timestamp, uint prize, address sender);
    event payback(uint timestamp, uint value);
    event finalRefund(uint timestamp, uint refund);
    event stashPayout(uint timestamp, uint payout);
    event numberSubmitted(uint timestamp, bytes32 hash, address sender);
    event numberUncovered(uint timestamp, uint number, address sender);
    event prizeRecycled(uint timestamp, uint netValue, uint fromRound);
    event prizePumped(uint timestamp, uint value, address sender);
    event newRoundStarted(uint timestamp);


    function LowestUniqueNumberGame() internal {
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

    function checkForActiveGamePeriod() public constant returns (bool){
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

    function isPrizeExpired(uint roundId) public constant returns (bool){
        if( block.timestamp > roundList[roundId].startTime + 2 days + rules.prizeExpiration){
            return true;
        }
        return false;
    }

    function hashNumber(uint number, string password) public constant returns (bytes32){
        require(number != 0);
        return sha3(number, password, msg.sender);
    }

    function hashNumberInternal(uint number, string password, address sender) internal constant returns (bytes32){
        require(number != 0);
        return sha3(number, password, sender);
    }

    function newRound() internal constant returns  (Round){
        return Round({startTime: block.timestamp, winner: 0x0, smallestNumber: 0, numberOfGuesses: 0, numbersUncoveredUnsorted: new uint[](0), prizeClaimed: false, value: 0});
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
        payback(block.timestamp, difference);
        roundToPayBack.payments[hash] = cost;
        roundToPayBack.value -= difference;
    }

    function startNewRound() internal{
        roundList.push(newRound());
        noWinnerValueCarry();
        taxes();
        if(ruleUpdateNeeded) updateRules();
        delete candidatesHeap;
        newRoundStarted(block.timestamp);
    }

    function submitSecretNumber(bytes32 hash) public payable onlyActive{
        if (!checkForActiveGamePeriod()) {
            startNewRound();
        }
        Round storage activeRound = roundList[SafeMath.safeSub(roundList.length, 1)];
        require(msg.value >= rules.numberPrice);
        activeRound.secretNumberAddresses[hash] = msg.sender;
        activeRound.payments[hash] = msg.value;
        activeRound.value += msg.value;
        activeRound.numberOfGuesses += 1;
        numberSubmitted(block.timestamp, hash, msg.sender);
    }

    function uncoverNumber(uint number, string password) public onlyActive{
        if (!checkForActiveGamePeriod()) {
            startNewRound();
        }
        bytes32 hash = hashNumberInternal(number, password, msg.sender);
        require(number != 0);
        Round storage roundToUncover = roundList[SafeMath.safeSub(roundList.length, 2)];
        require(roundToUncover.secretNumberAddresses[hash] == msg.sender);
        roundToUncover.secretNumberAddresses[hash] = 0x0; //only uncoverable once, prevents double uncover accidents
        require(checkIfPriceWasPayed(number, hash));
        payBackDifference(number, hash);
        roundToUncover.numbersUncoveredUnsorted.push(number);
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
        numberUncovered(block.timestamp, number, msg.sender);
    }

    function checkIfClaimable(uint roundID) public constant returns (bool){
      bool result = (roundID != SafeMath.safeSub(roundList.length, 1) && /*it can not be the most recent round*/
      (roundID != SafeMath.safeSub(roundList.length, 2) || !checkForActiveGamePeriod()) ); /*it can only be the second recent round if there is no active game in the first round*/
      return result;
    }

    function claimPrize(uint roundID) public {
        require(checkIfClaimable(roundID));
        require(!roundList[roundID].prizeClaimed);
        require(msg.sender == roundList[roundID].winner);
        msg.sender.transfer(roundList[roundID].value);
        prizeClaimed(block.timestamp, roundList[roundID].value, msg.sender);
        roundList[roundID].prizeClaimed = true;

    }

    function pumpUp() public payable onlyActive{
        if (!checkForActiveGamePeriod()) {
            startNewRound();
        }
        roundList[SafeMath.safeSub(roundList.length, 1)].value += msg.value;
        prizePumped(block.timestamp, msg.value, msg.sender);
    }

    function recyclePrize(uint roundID) public onlyActive {
        require(isPrizeExpired(roundID));
        require(! roundList[roundID].prizeClaimed);
        uint netRecycleValue = roundList[roundID].value / 100 * (100 - rules.expirationEdgePercent);
        roundList[SafeMath.safeSub(roundList.length, 1)].value += netRecycleValue;
        stash += roundList[roundID].value / 100 * rules.expirationEdgePercent;
        roundList[roundID].prizeClaimed = true;
        prizeRecycled(block.timestamp, netRecycleValue, roundID);
    }

    function noWinnerValueCarry() internal {
        if (roundList.length <= 2) return;
        if (roundList[SafeMath.safeSub(roundList.length, 3)].winner == 0x0){
            uint value = roundList[SafeMath.safeSub(roundList.length, 3)].value;
            roundList[SafeMath.safeSub(roundList.length, 3)].value = 0;
            roundList[SafeMath.safeSub(roundList.length, 1)].value += value;
        }
    }

    function taxes() internal {
        if (roundList.length <= 2) return;
        if (roundList[SafeMath.safeSub(roundList.length, 3)].winner != 0x0){
            uint lastRoundValue = roundList[SafeMath.safeSub(roundList.length, 3)].value;
            uint edge = lastRoundValue / 100 * rules.edgePercent;
            uint carry = lastRoundValue / 100 * rules.prizeCarryPercent;
            roundList[SafeMath.safeSub(roundList.length, 3)].value = SafeMath.safeSub(lastRoundValue, (edge + carry));
            roundList[SafeMath.safeSub(roundList.length, 1)].value += carry;
            stash += edge;
        }
    }

    function finalPayout(uint roundID, bytes32 hash) public {
        require(deactivated);
        require(roundID == SafeMath.safeSub(roundList.length, 1) || roundID == SafeMath.safeSub(roundList.length, 2)); // only last two rounds, older rounds have only prizes for the winners
        require(roundList[roundID].secretNumberAddresses[hash] == msg.sender);
        uint refound = roundList[roundID].payments[hash];
        require(refound != 0);
        msg.sender.transfer(refound);
        finalRefund(block.timestamp, refound);
        roundList[roundID].payments[hash]=0;
    }

    function cashOut(uint amount) public onlyOwner{
        uint actualAmount;
        if(amount == 0 || amount > stash){
            actualAmount = stash;
        } else {
            actualAmount = amount;
        }
        owner.transfer(actualAmount);
        stashPayout(block.timestamp, actualAmount);
    }

    function deactivate() public onlyOwner{
        deactivated = true;
        deactivationTime = block.timestamp;
    }

    function kill() public onlyOwner{
        require(deactivationTime + 10 days < block.timestamp);
        selfdestruct(owner);
    }

    function setPrizeCarryPercent(uint newPrizeCarryPercent) public onlyOwner {
        newRules.prizeCarryPercent = newPrizeCarryPercent;
        ruleUpdateNeeded = true;
    }

    function setEdgePercent(uint newEdgePercent) public onlyOwner {
        newRules.edgePercent = newEdgePercent;
        ruleUpdateNeeded = true;
    }

    function setPeriodLength(uint newPeriodLength) public onlyOwner {
        newRules.periodLength = newPeriodLength;
        ruleUpdateNeeded = true;
    }

    function setNumberPrice(uint newNumberPrice) public onlyOwner {
        newRules.numberPrice = newNumberPrice;
        ruleUpdateNeeded = true;
    }

    function setPrizeExpiration(uint numberOfDays) public onlyOwner{
        require(numberOfDays > 1);
        newRules.prizeExpiration = numberOfDays * 1 days;
        ruleUpdateNeeded = true;
    }

    function setExpirationEdgePercent(uint newExpirationEdgePercent) public onlyOwner{
        newRules.expirationEdgePercent = newExpirationEdgePercent;
        ruleUpdateNeeded = true;
    }

    function updateRules() internal{
        rules = newRules;
        ruleUpdateNeeded = false;
    }

    function getWinner(uint roundID) public constant returns (address){
        return roundList[roundID].winner;
    }

    function getPrizeCarryPercent() public constant returns (uint) {
        return rules.prizeCarryPercent;
    }

    function getEdgePercent() public constant returns (uint) {
        return rules.edgePercent;
    }

    function getPeriodLength() public constant returns (uint) {
        return rules.periodLength;
    }

    function getPrizeExpiration() public constant returns (uint) {
        return rules.prizeExpiration;
    }

    function getExpirationEdgePercent() public constant returns (uint) {
        return rules.expirationEdgePercent;
    }

    function getNumberPrice() public constant returns (uint) {
        return rules.numberPrice;
    }

    function getNumberOfRounds() public constant returns (uint) {
        return roundList.length;
    }

    function getSenderByRoundIDAndHash(uint roundID, bytes32 hash) public constant returns (address){
        return roundList[roundID].secretNumberAddresses[hash];
    }

    function getRoundValue(uint roundID) public constant returns (uint){
        return roundList[roundID].value;
    }

    function getStartTime(uint roundID) public constant returns (uint){
        return roundList[roundID].startTime;
    }

    function getSmallestNumber(uint roundID) public constant returns (uint){
        return roundList[roundID].smallestNumber;
    }

    function getNumberOfGuesses(uint roundID) public constant returns (uint){
        return roundList[roundID].numberOfGuesses;
    }

    function getNumberOfUncovers(uint roundID) public constant returns (uint){
        return roundList[roundID].numbersUncoveredUnsorted.length;
    }

    function getUncoveredNumber(uint roundID, uint i) public constant returns (uint){
        return roundList[roundID].numbersUncoveredUnsorted[i];
    }

    function getAllNumbers(uint roundID) public constant returns (string){
        uint length = roundList[roundID].numbersUncoveredUnsorted.length;
        string memory result = "";
        if (length > 0){
            result = uintToString(roundList[roundID].numbersUncoveredUnsorted[0]);
            for (uint i = 1; i < length; i+=1){
                result = strConcat(result, ",");
                result = strConcat(result, uintToString(roundList[roundID].numbersUncoveredUnsorted[i]));
            }
        }
        return result;
    }

    function uintToString(uint n) internal constant returns (string){
        return bytes32ToString(uintToBytes(n));
    }

    function uintToBytes(uint v) public constant returns (bytes32 ret) {
        if (v == 0) {
            ret = '0';
        }
        else {
            while (v > 0) {
                ret = bytes32(uint(ret) / (2 ** 8));
                ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
                v /= 10;
            }
        }
        return ret;
    }

    function bytes32ToString(bytes32 x) internal constant returns (string) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }

    function strConcat(string a, string b) internal constant returns (string){
        bytes memory bytesA = bytes(a);
        bytes memory bytesB = bytes(b);
        string memory result = new string(bytesA.length + bytesB.length);
        bytes memory bytesResult = bytes(result);
        uint k = 0;
        for (uint i = 0; i < bytesA.length; i++) bytesResult[k++] = bytesA[i];
        for (i = 0; i < bytesB.length; i++) bytesResult[k++] = bytesB[i];
        return string(result);
    }



    function getPrizeClaimed(uint roundID) public constant returns (bool){
        return roundList[roundID].prizeClaimed;
    }

}
