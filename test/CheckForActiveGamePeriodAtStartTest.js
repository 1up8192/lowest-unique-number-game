var TestHelpers = artifacts.require("TestHelpers");

contract( "check for active game period at start test", function(accounts) {
  it("should be incative after a guess is recieved", function(){
    var th;
    var number = 1;
    var numberPrice;
    var hash;
    var numberOfRounds;
    var address;
    return TestHelpers.deployed().then(function(instance){
      th = instance;
      return th.checkForActiveGamePeriod.call();
    }).then(function(result){
      assert.equal(result, false, "should be false at start");
    });
  });
});
