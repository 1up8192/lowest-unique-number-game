var MinHeapTestHelper = artifacts.require("MinHeapTestHelper");

contract( "Remove number test", function(accounts) {
  it("should remove one number", function(){
    var mhth;
    var number1 = 1;
    var number2 = 2;
    return MinHeapTestHelper.deployed().then(function(instance){
      mhth = instance;
      return mhth.insert(number1);
    }).then(function(){
      return mhth.insert(number2);
    }).then(function(){
      return mhth.removeNumber(number1);
    }).then(function(){
      return mhth.min.call();
    }).then(function(min){
      assert.equal(min, number2, "root wasnt the expected number");
    });
  });
});
