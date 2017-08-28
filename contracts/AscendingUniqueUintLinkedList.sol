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

    function deleteElement(uint n) internal returns (bool){
        if (elements[n].previous == 0 && elements[n].next == 0) return false; //not in the list
        if (n == head){
            uint newHead = elements[n].next;
            head = newHead;
        } else if (n == tail){
            uint newTail = elements[n].previous;
            tail = newTail;
        } else {
            uint previous = elements[n].previous;
            uint next = elements[n].next;
            elements[previous].next = next;
            elements[next].previous = previous;
        }
        return true;
    }

    function insertElement(uint n) internal returns (bool){
        if (elements[n].previous != 0 || elements[n].next != 0) return false; //already in the list
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
        return true;
    }

    function insertAfterPrevious(uint n, uint previous) internal {
        uint next = elements[previous].next;
        elements[n].previous = previous;
        elements[n].next = next;
        elements[previous].next = n;
        elements[next].previous = n;
    }

    function seekPositionSides(uint n) constant returns (uint) {
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

    function seekPositionCenter(uint n) constant returns (uint) {
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

    function check(uint n) constant returns (bool){
        if (elements[n].previous != 0 || elements[n].next != 0){
            return true;
        } else {
            return false;
        }
    }
}
