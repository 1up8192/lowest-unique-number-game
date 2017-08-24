pragma solidity ^0.4.11;

contract AscendingUniqueUintLinkedList{
    struct Element {
        uint next;
        uint previous;
    }

    uint size;
    uint head;
    mapping(uint => Element) elements;

    function deleteElement() returns (bool){
        return false;
    }

    function insertElement(uint n) returns (bool){
        return false;
    }
}
