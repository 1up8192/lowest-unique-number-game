pragma solidity ^0.4.11;

import "./SafeMath.sol";

library MinHeap{
    struct Heap{
        uint[] heap;
    }

    function parent(uint i) internal constant returns (uint){
        if (i == 0) return i;
        return (SafeMath.safeSub(i, 1))/2;
    }

    function leftChild(uint i) internal constant returns (uint){
        return i*2+1;
    }

    function rightChild(uint i) internal constant returns (uint){
        return i*2+2;
    }

    function min(Heap storage self) public constant returns (uint){
        if(self.heap.length == 0) revert();
        return self.heap[0];
    }

    function insert(Heap storage self, uint n) public {
        self.heap.push(n);
        bubbleUp(self);
    }

    function remove(Heap storage self, uint i) internal {
        self.heap[i] = self.heap[SafeMath.safeSub(self.heap.length, 1)];
        self.heap.length = SafeMath.safeSub(self.heap.length, 1);
        if(self.heap.length > 0){
            sinkDown(self, i);
        } else {
            delete self.heap;
        }
    }

    function removeNumber(Heap storage self, uint n) public {
        uint i = findIndex(self, n);
        remove(self, i);
    }

    function findIndex(Heap storage self, uint n) internal constant returns (uint){
        uint i = 0;
        while (i <= SafeMath.safeSub(self.heap.length, 1)){
            if(self.heap[i] == n) return i;
            i += 1;
        }
        revert();
    }

    function sinkDown(Heap storage self, uint i) internal {
        while (smallestOf3(self, i) != i){
            uint smallest = smallestOf3(self, i);
            swapWithParent(self, smallest);
            i = smallest;
        }
    }

    function bubbleUp(Heap storage self) internal {
        uint i = SafeMath.safeSub(self.heap.length, 1);
        while (self.heap[i] < self.heap[parent(i)]){
            swapWithParent(self, i);
            i = parent(i);
        }
    }

    function swapWithParent(Heap storage self, uint i) internal {
        uint temp = self.heap[i];
        self.heap[i] = self.heap[parent(i)];
        self.heap[parent(i)] = temp;
    }

    function smallestOf3(Heap storage self, uint i) internal constant returns (uint){
        if ( (leftChild(i) >= self.heap.length || self.heap[i] < self.heap[leftChild(i)]) && (rightChild(i) >= self.heap.length || self.heap[i] < self.heap[rightChild(i)]) ) return i;
        if ( (leftChild(i) < self.heap.length) && (self.heap[leftChild(i)] < self.heap[rightChild(i)]) ) return self.heap[leftChild(i)];
        return self.heap[rightChild(i)];
    }
}
