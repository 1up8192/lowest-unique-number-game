// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import lung_artifacts from '../../build/contracts/LowestUniqueNumberGame.json';
import th_artifacts from '../../build/contracts/TestHelpers.json';

import tableHelper from './tableHelper.js';

// HelloWorld is our usable abstraction, which we'll use through the code below.
var LowestUniqueNumberGame = contract(lung_artifacts);
var TestHelpers = contract(th_artifacts)
var ContractAbstraction = LowestUniqueNumberGame;

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

var self;

var testMode;

window.App = {
  start: function() {
    self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    LowestUniqueNumberGame.setProvider(web3.currentProvider);
    TestHelpers.setProvider(web3.currentProvider);


    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      console.log("accounts: ");
      console.log(accounts);

      self.setMode();

    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  hashAndSubmitGuess: function() {
    var number = document.getElementById("sendNumberInput").value;
    var password = document.getElementById("sendPasswordInput").value;
    var decoy = parseInt(web3.toWei(document.getElementById("sendDecoyInput").value, "ether"));
    var hash;
    var numberPrice;
    var instance;
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.hashNumber.call(number, password);
    }).then(function(_hash){
      hash = _hash;
      return instance.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      console.log(typeof(decoy));
      console.log(typeof(numberPrice));
      console.log(decoy);
      console.log(numberPrice);
      return instance.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number + decoy, gas: 500000});
    }).then(function(result) {
      console.log(result);
      self.setStatus("Transaction complete!");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  uncoverNumber: function() {
    var number = document.getElementById("uncoverNumberInput").value;
    var password = document.getElementById("uncoverPasswordInput").value;
    var instance;
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.uncoverNumber(number, password, {from: accounts[0], gas: 1000000});
    }).then(function(result) {
      console.log(result);
      self.setStatus("Transaction complete!");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  skipRound: function() {
    var instance;
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.skipRound({from: accounts[0], gas: 200000});
    }).then(function(result) {
      console.log("Round skipped!")
      console.log(result);
      self.setStatus("Transaction complete!");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  toggleSkipDisplay: function() {
    var skip = document.getElementById("skip");
    if(testMode){
      skip.style.display = 'block';
    } else {
        skip.style.display = 'none';
    }
  },

  setMode: function() {
    testMode = document.getElementById("testModeCheckbox").checked;
    self.toggleSkipDisplay();
    if (testMode == true){
      ContractAbstraction = TestHelpers;
      console.log("test mode");
    } else {
      ContractAbstraction = LowestUniqueNumberGame;
      console.log("game mode");
    }
  }



/*  watchEvent: function() {
    var changesTable = document.getElementById("changes")
    addHeaderRow(changesTable, ["Old greeting:", "New Greeting:", "Changer Address:"])

    var helloWorld;
    LowestUniqueNumberGame.deployed().then(function(instance) {
      helloWorld = instance;
      var eventGreetingChanged = helloWorld.greetingChanged();

      // watch for changes
      eventGreetingChanged.watch(function(error, result){
        if (!error){
          console.log(result);
        } else {
          console.log(error);
        }
      });
    });
  }*/

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();

  //App.watchEvent();

});
