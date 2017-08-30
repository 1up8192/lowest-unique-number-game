pragma solidity ^0.4.11;

library MinHeap{
    struct MinHeap{
        uint size;
        uint[] heap;
    }

    function parent(uint i) constant returns (uint){
        return (i-1)/2;
    }

    function leftChild(uint i) constant returns (uint){
        return i*2+1;
    }

    function rightChild(uint i) constant returns (uint){
        return i*2+2;
    }

    function min(MinHeap storage self) constant returns (uint){
        return self.heap[0];
    }

    function insert(MinHeap storage self, uint n) {
        self.heap[self.size] = n;
        bubbleUp(self);
        self.size += 1;
    }

    function removeMin(MinHeap storage self){
        self.heap[0] = self.heap[self.size - 1];
        sinkDown(self);
        self.size -= 1;
    }

    function sinkDown(MinHeap storage self){
        uint i = 0;
        while (smallestOf3(self, i) != i){
            uint smallest = smallestOf3(self, i);
            swapWithParent(self, smallest);
            i = smallest;
        }
    }

    function bubbleUp(MinHeap storage self){
        uint i = self.size - 1;
        while (self.heap[i] < self.heap[parent(i)]){
            swapWithParent(self, i);
            i = parent(i);
        }
    }

    function swapWithParent(MinHeap storage self, uint i){
        uint temp = self.heap[i];
        self.heap[i] = self.heap[parent(i)];
        self.heap[parent(i)] = temp;
    }

    function smallestOf3(MinHeap storage self, uint i) constant returns (uint){
        if (self.heap[i] < self.heap[leftChild(i)] && self.heap[i] < self.heap[rightChild(i)]) return i;
        if (self.heap[leftChild(i)] < self.heap[rightChild(i)]) return self.heap[leftChild(i)];
        return self.heap[rightChild(i)];
    }

}
