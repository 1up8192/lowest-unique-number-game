import "./MinHeap.sol";

contract MinHeapTestHelper{
    MinHeap.Heap heap;

    function parent(uint i) constant returns (uint){
        return MinHeap.parent(i);
    }

    function leftChild(uint i) constant returns (uint){
        return MinHeap.leftChild(i);
    }

    function rightChild(uint i) constant returns (uint){
        return MinHeap.rightChild(i);
    }

    function min() constant returns (uint){
        return MinHeap.min(heap);
    }

    function insert(uint n) {
        MinHeap.insert(heap, n);
    }

    function remove(uint i){
        MinHeap.remove(heap, i);
    }

    function removeNumber(uint n){
        MinHeap.removeNumber(heap, n);
    }

    function findIndex(uint n) constant returns (uint){
        return MinHeap.findIndex(heap, n);
    }

    function sinkDown(uint i){
        MinHeap.sinkDown(heap, i);
    }

    function bubbleUp(){
        MinHeap.bubbleUp(heap);
    }

    function swapWithParent(uint i){
        MinHeap.swapWithParent(heap, i);
    }

    function smallestOf3(uint i) constant returns (uint){
        return MinHeap.smallestOf3(heap, i);
    }
}
