// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import lung_artifacts from '../../build/contracts/LowestUniqueNumberGame.json';
import th_artifacts from '../../build/contracts/TestHelpers.json';

import tableHelper from './tableHelper.js';

import * as moment from 'moment'

var asyncWhile = require("async-while");

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
      self.refreshAllStats();

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
      return instance.hashNumber.call(number, password, {from: accounts[0]});
    }).then(function(_hash){
      hash = _hash;
      return instance.getNumberPrice.call();
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return instance.submitSecretNumber(hash, {from: accounts[0], value: numberPrice * number + decoy, gas: 500000});
    }).then(function(result) {
      console.log("sercet number submitted");
      console.log(result);
      self.setStatus("Transaction complete!");
      self.refreshActiveRoundStatsDisplay();
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
      console.log("number uncovered")
      console.log(result);
      self.setStatus("Transaction complete!");
      self.refreshUncoverRoundStatsDisplay();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  getRoundStats: function(roundId) {
    var startTime;
    var winner;
    var smallestNumber;
    var numberOfGuesses;
    var numberOfUncovers;
    var prizeClaimed;
    var value;
    var instance;
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.getStartTime.call(roundId);
    }).then(function(_startTime) {
      startTime = _startTime.toNumber();
      return instance.getWinner.call(roundId);
    }).then(function(_winner) {
      winner = _winner.toString();
      return instance.getSmallestNumber.call(roundId);
    }).then(function(_smallestNumber) {
      smallestNumber = _smallestNumber.toNumber();
      return instance.getNumberOfGuesses.call(roundId);
    }).then(function(_numberOfGuesses) {
      numberOfGuesses = _numberOfGuesses.toNumber();
      return instance.getNumberOfUncovers.call(roundId);
    }).then(function(_numberOfUncovers) {
      numberOfUncovers = _numberOfUncovers.toNumber();
      return instance.getPrizeClaimed.call(roundId);
    }).then(function(_prizeClaimed) {
      prizeClaimed = _prizeClaimed;
      return instance.getRoundValue.call(roundId);
    }).then(function(_value) {
      value = web3.fromWei(_value, "ether").toNumber();
      var result = {
        startTime: startTime,
        winner: winner,
        smallestNumber: smallestNumber,
        numberOfGuesses: numberOfGuesses,
        numberOfUncovers: numberOfUncovers,
        prizeClaimed: prizeClaimed,
        value: value
      };
      console.log("queried round stats");
      console.log(result);
      return result;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  getRules: function(){
    var prizeCarryPercent;
    var edgePercent;
    var periodLength;
    var numberPrice;
    var prizeExpiration;
    var expirationEdgePercent;
    var instance;
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.getPrizeCarryPercent.call();
    }).then(function(_prizeCarryPercent) {
      prizeCarryPercent = _prizeCarryPercent.toNumber();
      return instance.getEdgePercent.call();
    }).then(function(_edgePercent) {
      edgePercent = _edgePercent.toNumber();
      return instance.getPeriodLength.call();
    }).then(function(_periodLength) {
      periodLength = _periodLength.toNumber();
      return instance.getNumberPrice.call();
    }).then(function(_numberPrice) {
      numberPrice = web3.fromWei(_numberPrice, "ether").toNumber();
      return instance.getPrizeExpiration.call();
    }).then(function(_prizeExpiration) {
      prizeExpiration = _prizeExpiration.toNumber();
      return instance.getExpirationEdgePercent.call();
    }).then(function(_expirationEdgePercent) {
      expirationEdgePercent = _expirationEdgePercent.toNumber();
      var result = {
        prizeCarryPercent: prizeCarryPercent,
        edgePercent: edgePercent,
        periodLength: periodLength,
        numberPrice: numberPrice,
        prizeExpiration: prizeExpiration,
        expirationEdgePercent: expirationEdgePercent
      };
      console.log("queried rules");
      console.log(result);
      return result;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  getPastRoundStats: function() {
    var roundId = document.getElementById("roundNumberInput").value - 1;
    var roundData
    return self.getRoundStats(roundId).then(function(_roundData){
      roundData = _roundData;
      return self.getRules();
    }).then(function(rules){
      var isPrizeExpired = self.isExpired(roundData.startTime, rules.prizeExpiration);
      document.getElementById("roundStartTime").innerHTML = self.timestampToDateTime(roundData.startTime);
      document.getElementById("roundNumberCount").innerHTML = roundData.numberOfGuesses;
      document.getElementById("roundUncoverCount").innerHTML = roundData.numberOfUncovers;
      document.getElementById("roundValue").innerHTML = roundData.value + " ETH";
      document.getElementById("roundWinnerNumber").innerHTML = roundData.smallestNumber;
      document.getElementById("roundWinner").innerHTML = roundData.winner;
      document.getElementById("roundAllNumbers").innerHTML = self.getAllNumbers(roundId);
      document.getElementById("roundPrizeClaimed").innerHTML = roundData.prizeClaimed;
      document.getElementById("roundPrizeExpired").innerHTML = isPrizeExpired;
    });
  },

  refreshAllStats: function(){
    self.refreshRulesDisplay();
    self.refreshActiveRoundStatsDisplay();
    self.refreshUncoverRoundStatsDisplay();
    self.refreshLastClosedRoundStatsDisplay();
    self.calculatePrice();
  },

  refreshRulesDisplay: function(){
    return self.getRules().then(function(rules){
      document.getElementById("prizeCarryPercent").innerHTML = rules.prizeCarryPercent + "%";
      document.getElementById("edgePercent").innerHTML = rules.edgePercent + "%";
      document.getElementById("periodLength").innerHTML = self.timestampToTime(rules.periodLength);
      document.getElementById("numberPrice").innerHTML = rules.numberPrice + " ETH";
      document.getElementById("prizeExpiration").innerHTML = self.timestampToDays(rules.prizeExpiration);
      document.getElementById("expirationEdgePercent").innerHTML = rules.expirationEdgePercent + "%";
    });
  },

  refreshActiveRoundStatsDisplay: function(){
    var numberOfRounds;
    var activeRoundData;
    return self.getNumberOfRounds().then(function(_numberOfRounds){
      numberOfRounds = _numberOfRounds;
      return self.getRoundStats(numberOfRounds - 1);
    }).then(function(_roundData){
      activeRoundData = _roundData;
      return self.getRules();
    }).then(function(rules){
      document.getElementById("activeRoundNumber").innerHTML = numberOfRounds;
      document.getElementById("activeRoundStartTime").innerHTML = self.timestampToDateTime(activeRoundData.startTime);
      document.getElementById("activeRoundRemainingTime").innerHTML = self.timestampToTime( (activeRoundData.startTime + rules.periodLength) - Math.floor(Date.now() / 1000) );
      document.getElementById("activeRoundEndTime").innerHTML = self.timestampToDateTime(activeRoundData.startTime + rules.periodLength);
      document.getElementById("activeRoundNumberCount").innerHTML = activeRoundData.numberOfGuesses;
      document.getElementById("activeRoundValue").innerHTML = activeRoundData.value + " ETH";
    });
  },

  refreshUncoverRoundStatsDisplay: function(){
    var numberOfRounds;
    var uncoverRoundData;
    return self.getNumberOfRounds().then(function(_numberOfRounds){
      numberOfRounds = _numberOfRounds;
      return self.getRoundStats(numberOfRounds - 2);
    }).then(function(_roundData){
      uncoverRoundData = _roundData;
      return self.getRules();
    }).then(function(rules){
      document.getElementById("uncoverRoundNumber").innerHTML = numberOfRounds - 1;
      document.getElementById("uncoverRoundStartTime").innerHTML = self.timestampToDateTime(uncoverRoundData.startTime);
      document.getElementById("uncoverRoundRemainingTime").innerHTML = self.timestampToTime( (uncoverRoundData.startTime + rules.periodLength) - Math.floor(Date.now() / 1000) );
      document.getElementById("uncoverRoundEndTime").innerHTML = self.timestampToDateTime(uncoverRoundData.startTime + rules.periodLength);
      document.getElementById("uncoverRoundNumberCount").innerHTML = uncoverRoundData.numberOfGuesses;
      document.getElementById("uncoverRoundUncoverCount").innerHTML = uncoverRoundData.numberOfUncovers;
      document.getElementById("uncoverRoundValue").innerHTML = uncoverRoundData.value + " ETH";
      document.getElementById("uncoverRoundWinnerNumber").innerHTML = uncoverRoundData.smallestNumber;
      document.getElementById("uncoverRoundWinner").innerHTML = uncoverRoundData.winner;
    });
  },

  refreshLastClosedRoundStatsDisplay: function(){
    var numberOfRounds;
    var lastClosedRoundData;
    return self.getNumberOfRounds().then(function(_numberOfRounds){
      numberOfRounds = _numberOfRounds;
      return self.getRoundStats(numberOfRounds - 3);
    }).then(function(_roundData){
      lastClosedRoundData = _roundData;
      return self.getRules();
    }).then(function(rules){
      document.getElementById("lastClosedRoundNumber").innerHTML = numberOfRounds - 2;
      document.getElementById("lastClosedRoundStartTime").innerHTML = self.timestampToDateTime(lastClosedRoundData.startTime);
      document.getElementById("lastClosedRoundRemainingTime").innerHTML = self.timestampToTime( (lastClosedRoundData.startTime + rules.periodLength) - Math.floor(Date.now() / 1000) );
      document.getElementById("lastClosedRoundEndTime").innerHTML = self.timestampToDateTime( lastClosedRoundData.startTime + rules.periodLength);
      document.getElementById("lastClosedRoundNumberCount").innerHTML = lastClosedRoundData.numberOfGuesses;
      document.getElementById("lastClosedRoundUncoverCount").innerHTML = lastClosedRoundData.numberOfUncovers;
      document.getElementById("lastClosedRoundValue").innerHTML = lastClosedRoundData.value + " ETH";
      document.getElementById("lastClosedRoundWinnerNumber").innerHTML = lastClosedRoundData.smallestNumber;
      document.getElementById("lastClosedRoundWinner").innerHTML = lastClosedRoundData.winner;
      document.getElementById("lastClosedRoundPrizeClaimed").innerHTML = lastClosedRoundData.prizeClaimed;
    });
  },

  getNumberOfRounds: function(){
    var instance;
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.getNumberOfRounds.call();
    }).then(function(result) {
      console.log("queried number of rounds");
      console.log(result);
      return result;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  isExpired: function(startTime, expiryTime){
    if(startTime + expiryTime < Math.floor(Date.now() / 1000)){
      return true;
    } else {
      return false;
    }
  },

  skipRound: function() {
    var instance;
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.skipRound({from: accounts[0], gas: 200000});
    }).then(function(result) {
      console.log("round skipped")
      console.log(result);
      self.setStatus("Transaction complete!");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  getAllNumbers: function(roundID) {
    var instance;
    var results = [];
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.getNumberOfUncovers.call(roundID);
    }).then(function(result) {
      var lenght = result;
      var index = -1;
      return asyncWhile(function() {
        // bump index before every loop
        index += 1;

        // synchronously checks if there are more
        return index < lenght;
      }, function() {
        return instance.getUncoveredNumber.call(roundID, index).then(function(result) {
          return results.push(result);
        });
      });
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
  },

  calculateDecoy: function() {
    return self.getRules().then(function(rules){
      var numberPrice = rules.numberPrice;
      document.getElementById("sendDecoyInput").value = numberPrice * Math.floor(Math.random() * 100);
      self.calculatePrice();
    });
  },

  calculatePrice: function() {
    if(document.getElementById("sendNumberInput").value && document.getElementById("sendDecoyInput").value)
    return self.getRules().then(function(rules){
      var numberPrice = parseFloat(rules.numberPrice);
      var number = parseFloat(document.getElementById("sendNumberInput").value);
      var decoy = parseFloat(document.getElementById("sendDecoyInput").value);
      document.getElementById("sendTransactionPrice").innerHTML = (number * numberPrice + decoy).toFixed(Math.ceil(Math.abs(self.getBaseLog(10, numberPrice)))) + " ETH";
    });
  },

  getBaseLog: function(x, y) {
    return Math.log(y) / Math.log(x);
  },

  timestampToTime: function(timestamp){
    var hours = Math.floor(timestamp/3600);
    var remainingTime = timestamp % 3600;

    var minutes = Math.floor(remainingTime / 60);
    remainingTime = remainingTime % 60;

    var seconds = remainingTime;

    var formattedTime = '';
    if (parseInt(hours) > 0) formattedTime += hours + ' hours';
    if (parseInt(minutes) > 0) formattedTime += ', ' + minutes + ' minutes';
    if (parseInt(seconds) > 0) formattedTime += ', ' + seconds + ' seconds';
    return formattedTime;
  },

  timestampToDays: function(timestamp){
    return timestamp / (24 * 60 * 60) + " days";
  },

  timestampToDateTime: function(timestamp){
    return moment.unix(timestamp).format("YYYY-MM-DD hh:mm");
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
