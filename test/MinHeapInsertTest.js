var MinHeapTestHelper = artifacts.require("MinHeapTestHelper");

contract( "Insert number test", function(accounts) {
  it("should insert one number to the root (min)", function(){
    var mhth;
    var number = 1;
    return MinHeapTestHelper.deployed().then(function(instance){
      mhth = instance;
      return mhth.insert(number);
    }).then(function(){
      return mhth.min.call();
    }).then(function(min){
      assert.equal(min, number, "root wasnt the inserted number");
    });
  });
});
