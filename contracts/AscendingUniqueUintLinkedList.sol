pragma solidity ^0.4.11;

library AscendingUniqueUintLinkedList{
    struct Element {
        uint previous;
        uint next;
    }

    struct AUULL{
        uint size;
        uint head;
        uint tail;
        mapping(uint => Element) elements;
    }

    function deleteElement(AUULL storage self, uint n) internal returns (bool) { //true if new head (smallest number)
        if (n == self.head){
            uint newHead = self.elements[n].next;
            self.head = newHead;
            return true;
        } else if (n == self.tail){
            uint newTail = self.elements[n].previous;
            self.tail = newTail;
            return false;
        } else {
            uint previous = self.elements[n].previous;
            uint next = self.elements[n].next;
            self.elements[previous].next = next;
            self.elements[next].previous = previous;
            return false;
        }
    }

    function insertElement(AUULL storage self, uint n) internal returns (bool){ //true if new head (smallest number)
        if (self.elements[n].previous != 0 || self.elements[n].next != 0) return false; //already in the list
        if (n < self.head || self.head == 0){
            self.elements[n] = Element({previous: 0, next: self.head});
            self.head = n;
            return true;
        } else if (n > self.tail){
            self.elements[n] = Element({previous: self.tail, next: 0});
            self.tail = n;
            return false;
        } else {
            uint previous;
            if (self.size-2 < (self.tail-self.head-1) / 2){
                previous = seekPositionSides(self, n);
            } else {
                previous = seekPositionCenter(self, n);
            }
            insertAfterPrevious(self, n, previous);
            return false;
        }
    }

    function insertAfterPrevious(AUULL storage self, uint n, uint previous) internal {
        uint next = self.elements[previous].next;
        self.elements[n].previous = previous;
        self.elements[n].next = next;
        self.elements[previous].next = n;
        self.elements[next].previous = n;
    }

    function seekPositionSides(AUULL storage self, uint n) constant returns (uint) {
        uint previous;
        uint position;
        if (n < (self.head+self.tail)/2){ //forward search
            for(position = self.head; position < n; position = self.elements[position].next){
                previous = self.elements[previous].previous;
            }
        } else { //backward search
            for(position = self.tail; position > n; position = self.elements[position].previous){
                previous = position;
            }
        }
        return previous;
    }

    function seekPositionCenter(AUULL storage self, uint n) constant returns (uint) {
        bool found = false;
        uint distance = 1;
        uint previous;
        do{
            if(self.elements[n-distance].next != 0){
                previous = n-distance;
                found = true;
            }
            if(self.elements[n+distance].previous != 0){
                previous = self.elements[n+distance].previous;
                found = true;
            }
            distance += 1;
        } while(!found);
        return previous;
    }

    function check(AUULL storage self, uint n) constant returns (bool){
        if (self.elements[n].previous != 0 || self.elements[n].next != 0){
            return true;
        } else {
            return false;
        }
    }
}
