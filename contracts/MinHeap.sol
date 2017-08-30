pragma solidity ^0.4.11;

library MinHeap{
    struct Heap{
        uint size;
        uint[] heap;
    }

    function parent(uint i) constant returns (uint){
        if (i == 0) return i;
        return (i-1)/2;
    }

    function leftChild(uint i) constant returns (uint){
        return i*2+1;
    }

    function rightChild(uint i) constant returns (uint){
        return i*2+2;
    }

    function min(Heap storage self) constant returns (uint){
        return self.heap[0];
    }

    function insert(Heap storage self, uint n) {
        self.heap[self.size] = n;
        bubbleUp(self);
        self.size += 1;
    }

    function remove(Heap storage self, uint i){
        self.heap[i] = self.heap[self.size - 1];
        sinkDown(self, i);
        self.size -= 1;
    }

    function removeNumber(Heap storage self, uint n){
        uint i = findIndex(self, n);
        remove(self, i);
    }

    function findIndex(Heap storage self, uint n) constant returns (uint){
        uint i = 0;
        while (i <= self.size - 1){
            if(self.heap[i] == n) return i;
            i += 1;
        }
        revert();
    }

    function sinkDown(Heap storage self, uint i){
        while (smallestOf3(self, i) != i){
            uint smallest = smallestOf3(self, i);
            swapWithParent(self, smallest);
            i = smallest;
        }
    }

    function bubbleUp(Heap storage self){
        uint i = self.size - 1;
        while (self.heap[i] < self.heap[parent(i)]){
            swapWithParent(self, i);
            i = parent(i);
        }
    }

    function swapWithParent(Heap storage self, uint i){
        uint temp = self.heap[i];
        self.heap[i] = self.heap[parent(i)];
        self.heap[parent(i)] = temp;
    }

    function smallestOf3(Heap storage self, uint i) constant returns (uint){
        if ((self.heap[i] < self.heap[leftChild(i)] || self.heap[leftChild(i)] == 0 ) && (self.heap[i] < self.heap[rightChild(i)] || self.heap[rightChild(i)] == 0 )) return i;
        if ( (self.heap[leftChild(i)] < self.heap[rightChild(i)]) && (self.heap[leftChild(i)] != 0)) return self.heap[leftChild(i)];
        return self.heap[rightChild(i)];
    }

}
