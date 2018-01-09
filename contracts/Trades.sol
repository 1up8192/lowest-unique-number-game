pragma solidity ^0.4.18;

import "./MinHeap.sol";

contract Trades {
    
    struct Trade{
        uint startDate;
        uint actualEndDate;
        uint maxLength;
        uint weiValueGive;
        address tokenToGet;
        uint tokenAtomValueToGet;
        address exchange;
        int profitPercent;
    }
    
    mapping(uint => Trade) internal trades; /*All trades(value) mapped to a sequential ID(key)*/
    mapping(address => uint[]) internal activeTrades; /*All active (open) tradeID-s(value, list) mapped to their trader(key)*/
    mapping(address => uint[]) internal pastTrades; /*All past (closed) tradeID-s(value, list) mapped to their trader(key)*/
    mapping(uint => uint) internal expirations; /* key: expiration dates, value: tradeID-s*/
    
    MinHeap.Heap internal expirationsSorted; /* expiration dates sorted in a heap*/
    
    function openTrade(){
        
    }
    
    function closeExpiredTrade(){
        
    }
    
    function closeTrade(){
        
    }
    
    
    
    
}
