// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import lung_artifacts from '../../build/contracts/LowestUniqueNumberGame.json'

import tableHelper from './tableHelper.js'

// HelloWorld is our usable abstraction, which we'll use through the code below.
var LowestUniqueNumberGame = contract(lung_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    LowestUniqueNumberGame.setProvider(web3.currentProvider);

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

    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  hashAndSubmitGuess: function() {
    var number = document.getElementById("sendNumberInput");
    var password = document.getElementById("sendPasswordInput");
    var decoy = web3.toWei(document.getElementById("sendDecoyInput"), "ether").toNumber();
    var hash;
    var numberPrice;
    return LowestUniqueNumberGame.deployed().then(function(instance){
      lung = instance;
      return lung.hashNumber.call(number, password, accounts[0]);
    }).then(function(_hash){
      hash = _hash;
      return lung.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return lung.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number + decoy});
    }).then(function(result) {
      console.log(result);
      self.setStatus("Transaction complete!");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
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
