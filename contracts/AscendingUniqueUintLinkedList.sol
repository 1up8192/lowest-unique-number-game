pragma solidity ^0.4.11;

contract AscendingUniqueUintLinkedList{
    struct Element {
        uint previous;
        uint next;
    }

    uint size;
    uint head;
    uint tail;
    mapping(uint => Element) elements;

    function deleteElement() returns (bool){
        return false;
    }

    function insertElement(uint n){
        if (n < head || head == 0){
            elements[n] = Element({previous: 0, next: head});
            head = n;
        } else if (n > tail){
            elements[n] = Element({previous: tail, next: 0});
            tail = n;
        } else {
            uint previous;
            if (size-2 < (tail-head-1) / 2){
                previous = seekPositionSides(n);
            } else {
                previous = seekPositionCenter(n);
            }
            insertAfterPrevious(n, previous);
        }
    }

    function insertAfterPrevious(uint n, uint previous) internal {
        uint next = elements[previous].next;
        elements[n].previous = previous;
        elements[n].next = next;
        elements[previous].next = n;
        elements[next].previous = n;
    }

    function seekPositionSides(uint n) returns (uint) {
        uint previous;
        uint position;
        if (n < (head+tail)/2){ //forward search
            for(position = head; position < n; position = elements[position].next){
                previous = elements[previous].previous;
            }
        } else { //backward search
            for(position = tail; position > n; position = elements[position].previous){
                previous = position;
            }
        }
        return previous;
    }

    function seekPositionCenter(uint n) returns (uint) {
        bool found = false;
        uint distance = 1;
        uint previous;
        do{
            if(elements[n-distance].next != 0){
                previous = n-distance;
                found = true;
            }
            if(elements[n+distance].previous != 0){
                previous = elements[n+distance].previous;
                found = true;
            }
            distance += 1;
        } while(!found);
        return previous;
    }
}
