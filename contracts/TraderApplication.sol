pragma solidity ^0.4.18;

contract TraderApplication{
    
    struct ApplicantStats{
        int score;
        uint8 negativeStreak; //number of last consecutive negative trades (0 if last trade was positive)
        uint start;
        uint16 numberOfTrades;
        uint funds;
        uint[] activeTrades; /*All active (open) tradeID-s(key) mapped to their trader(value)*/
        uint[] pastTrades; /*All past (closed) tradeID-s(key) mapped to their trader(value)*/
    }
    
    struct Rules{
        uint duration;
        uint passingProfit;
        uint passingScore;
    }
    
    struct Trade{
        uint startDate;
        uint endDate;
        uint weiValueGive;
        address tokenToGet;
        uint tokenAtomValueToGet;
        address exchange;
        int profitPercent;
    }
    
    mapping (address => ApplicantStats) internal applicants;
    mapping(uint => Trade) internal trades; /*All trades(value) mapped to a sequential ID(key)*/
    Rules public rules;


    function openTrade() public{
        
    }
    
    function closeTrade() public{
        
    }
    
    function startApplication() public{
        
    }
    
    function finishApplication() public{
        
    }
}
