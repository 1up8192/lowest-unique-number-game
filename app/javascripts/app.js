// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import lung_artifacts from '../../build/contracts/LowestUniqueNumberGame.json';
//import th_artifacts from '../../build/contracts/TestHelpers.json';

import * as tableHelper from './tableHelper.js';

import * as moment from 'moment'

var asyncWhile = require("async-while");

// HelloWorld is our usable abstraction, which we'll use through the code below.
var LowestUniqueNumberGame = contract(lung_artifacts);
//var TestHelpers = contract(th_artifacts)
var ContractAbstraction = LowestUniqueNumberGame;

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

var self;

var testMode;

var rules;

function getRoundStats(roundId) {
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
    return instance.getStartTime.call(roundId, {from: account});
  }).then(function(_startTime) {
    startTime = _startTime.toNumber();
    return instance.getWinner.call(roundId, {from: account});
  }).then(function(_winner) {
    winner = _winner.toString();
    return instance.getSmallestNumber.call(roundId, {from: account});
  }).then(function(_smallestNumber) {
    smallestNumber = _smallestNumber.toNumber();
    return instance.getNumberOfGuesses.call(roundId, {from: account});
  }).then(function(_numberOfGuesses) {
    numberOfGuesses = _numberOfGuesses.toNumber();
    return instance.getNumberOfUncovers.call(roundId, {from: account});
  }).then(function(_numberOfUncovers) {
    numberOfUncovers = _numberOfUncovers.toNumber();
    return instance.getPrizeClaimed.call(roundId, {from: account});
  }).then(function(_prizeClaimed) {
    prizeClaimed = _prizeClaimed;
    return instance.getRoundValue.call(roundId, {from: account});
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
}

function getRules(){
  var prizeCarryPercent;
  var edgePercent;
  var periodLength;
  var numberPrice;
  var prizeExpiration;
  var expirationEdgePercent;
  var instance;
  return ContractAbstraction.deployed().then(function(_instance){
    instance = _instance;
    return instance.getPrizeCarryPercent.call({from: account});
  }).then(function(_prizeCarryPercent) {
    prizeCarryPercent = _prizeCarryPercent.toNumber();
    return instance.getEdgePercent.call({from: account});
  }).then(function(_edgePercent) {
    edgePercent = _edgePercent.toNumber();
    return instance.getPeriodLength.call({from: account});
  }).then(function(_periodLength) {
    periodLength = _periodLength.toNumber();
    return instance.getNumberPrice.call({from: account});
  }).then(function(_numberPrice) {
    numberPrice = web3.fromWei(_numberPrice, "ether").toNumber();
    return instance.getPrizeExpiration.call({from: account});
  }).then(function(_prizeExpiration) {
    prizeExpiration = _prizeExpiration.toNumber();
    return instance.getExpirationEdgePercent.call({from: account});
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
    rules = result;
    return result;
  }).catch(function(e) {
    console.log(e);
    self.setStatus("Error; see log.");
  });
}

function getNumberOfRounds(){
  var instance;
  return ContractAbstraction.deployed().then(function(_instance){
    instance = _instance;
    return instance.getNumberOfRounds.call({from: account});
  }).then(function(result) {
    console.log("queried number of rounds");
    console.log(result);
    return result;
  }).catch(function(e) {
    console.log(e);
    self.setStatus("Error; see log.");
  });
}

function isExpired(startTime, expiryTime){
  if(startTime + expiryTime < Math.floor(Date.now() / 1000)){
    return true;
  } else {
    return false;
  }
}

function getAllNumbers(roundID) {
  var instance;
  var results = [];
  return ContractAbstraction.deployed().then(function(_instance){
    instance = _instance;
    return instance.getAllNumbers.call(roundID, {from: account});
  }).then(function(result) {
    var allNumbers = result.split(",");
    allNumbers.sort();
    console.log("get all numbers")
    console.log(allNumbers);
    self.setStatus("Transaction complete!");
    return allNumbers;
  }).catch(function(e) {
    console.log(e);
    self.setStatus("Error; see log.");
  });
}

function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

function timestampToTime(timestamp){
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
}

function timestampToDays(timestamp){
  return timestamp / (24 * 60 * 60) + " days";
}

function timestampToDateTime(timestamp){
  return moment.unix(timestamp).format("YYYY-MM-DD hh:mm");
}

window.App = {
  start: function() {
    self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    LowestUniqueNumberGame.setProvider(web3.currentProvider);
    //TestHelpers.setProvider(web3.currentProvider);


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

      //self.setMode();
      ContractAbstraction = LowestUniqueNumberGame;

      self.refreshAllStats();

    });
  },

  setStatus: function(message) {
    $("#status").html(message);
  },

  hashAndSubmitGuess: function() {
    var number = $("#sendNumberInput").val();
    var password = $("#sendPasswordInput").val();
    var decoy = parseInt(web3.toWei($("#sendDecoyInput").val(), "ether"));
    var hash;
    var numberPrice;
    var instance;
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.hashNumber.call(number, password, {from: account});
    }).then(function(_hash){
      hash = _hash;
      return instance.getNumberPrice.call({from: account});
    }).then(function(_numberPrice){
      numberPrice = _numberPrice.toNumber();
      return instance.submitSecretNumber(hash, {from: account, value: numberPrice * number + decoy, gas: 500000});
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
    var number = $("#uncoverNumberInput").val();
    var password = $("#uncoverPasswordInput").val();
    var instance;
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.uncoverNumber(number, password, {from: account, gas: 1000000});
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

  claimPrize: function(){
    var roundNumber = $("#claimRoundNumberInput").val();
    var instance;
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.claimPrize(roundNumber - 1, {from: account, gas: 1000000});
    }).then(function(result) {
      console.log("prize claimed")
      console.log(result);
      self.setStatus("Transaction complete!");
      self.refreshLastClosedRoundStatsDisplay();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  getPastRoundStats: function() {
    var roundId = $("#roundNumberInput").val() - 1;
    var roundData
    return getRoundStats(roundId).then(function(_roundData){
      roundData = _roundData;
      return getAllNumbers(roundId)
    }).then(function(allNumbers) {
      var isPrizeExpired = isExpired(roundData.startTime, rules.prizeExpiration);
      $("#roundStartTime").html(timestampToDateTime(roundData.startTime));
      $("#roundNumberCount").html(roundData.numberOfGuesses);
      $("#roundUncoverCount").html(roundData.numberOfUncovers);
      $("#roundValue").html(roundData.value + " ETH");
      $("#roundWinnerNumber").html(roundData.smallestNumber);
      $("#roundWinner").html(roundData.winner);
      $("#roundAllNumbers").html(allNumbers);
      $("#roundPrizeClaimed").html(roundData.prizeClaimed);
      $("#roundPrizeExpired").html(isPrizeExpired);
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
    return getRules().then(function(rules){
      $("#prizeCarryPercent").html(rules.prizeCarryPercent + "%");
      $("#edgePercent").html(rules.edgePercent + "%");
      $("#periodLength").html(timestampToTime(rules.periodLength));
      $("#numberPrice").html(rules.numberPrice + " ETH");
      $("#prizeExpiration").html(timestampToDays(rules.prizeExpiration));
      $("#expirationEdgePercent").html(rules.expirationEdgePercent + "%");
    });
  },

  refreshActiveRoundStatsDisplay: function(){
    var numberOfRounds;
    var activeRoundData;
    return getNumberOfRounds().then(function(_numberOfRounds){
      numberOfRounds = _numberOfRounds;
      return getRoundStats(numberOfRounds - 1);
    }).then(function(_roundData){
      activeRoundData = _roundData;
      $("#activeRoundNumber").html(numberOfRounds.toString());
      $("#activeRoundStartTime").html(timestampToDateTime(activeRoundData.startTime));
      $("#activeRoundRemainingTime").html(timestampToTime( (activeRoundData.startTime + rules.periodLength) - Math.floor(Date.now() / 1000) ));
      $("#activeRoundEndTime").html(timestampToDateTime(activeRoundData.startTime + rules.periodLength));
      $("#activeRoundNumberCount").html(activeRoundData.numberOfGuesses);
      $("#activeRoundValue").html(activeRoundData.value + " ETH");
    });
  },

  refreshUncoverRoundStatsDisplay: function(){
    var numberOfRounds;
    var uncoverRoundData;
    return getNumberOfRounds().then(function(_numberOfRounds){
      numberOfRounds = _numberOfRounds;
      return getRoundStats(numberOfRounds - 2);
    }).then(function(_roundData){
      uncoverRoundData = _roundData;
      $("#uncoverRoundNumber").html(numberOfRounds - 1);
      $("#uncoverRoundStartTime").html(timestampToDateTime(uncoverRoundData.startTime));
      $("#uncoverRoundRemainingTime").html(timestampToTime( (uncoverRoundData.startTime + rules.periodLength) - Math.floor(Date.now() / 1000) ));
      $("#uncoverRoundEndTime").html(timestampToDateTime(uncoverRoundData.startTime + rules.periodLength));
      $("#uncoverRoundNumberCount").html(uncoverRoundData.numberOfGuesses);
      $("#uncoverRoundUncoverCount").html(uncoverRoundData.numberOfUncovers);
      $("#uncoverRoundValue").html(uncoverRoundData.value + " ETH");
      $("#uncoverRoundWinnerNumber").html(uncoverRoundData.smallestNumber);
      $("#uncoverRoundWinner").html(uncoverRoundData.winner);
    });
  },

  refreshLastClosedRoundStatsDisplay: function(){
    var numberOfRounds;
    var lastClosedRoundData;
    return getNumberOfRounds().then(function(_numberOfRounds){
      numberOfRounds = _numberOfRounds;
      return getRoundStats(numberOfRounds - 3);
    }).then(function(_roundData){
      lastClosedRoundData = _roundData;
      return getAllNumbers(numberOfRounds - 3)
    }).then(function(allNumbers) {
      $("#lastClosedRoundNumber").html(numberOfRounds - 2);
      $("#lastClosedRoundStartTime").html(timestampToDateTime(lastClosedRoundData.startTime));
      $("#lastClosedRoundRemainingTime").html(timestampToTime( (lastClosedRoundData.startTime + rules.periodLength) - Math.floor(Date.now() / 1000) ));
      $("#lastClosedRoundEndTime").html(timestampToDateTime( lastClosedRoundData.startTime + rules.periodLength));
      $("#lastClosedRoundNumberCount").html(lastClosedRoundData.numberOfGuesses);
      $("#lastClosedRoundUncoverCount").html(lastClosedRoundData.numberOfUncovers);
      $("#lastClosedRoundValue").html(lastClosedRoundData.value + " ETH");
      $("#lastClosedRoundWinnerNumber").html(lastClosedRoundData.smallestNumber);
      $("#lastClosedRoundWinner").html(lastClosedRoundData.winner);
      $("#lastClosedRoundAllNumbers").html(allNumbers);
      $("#lastClosedRoundPrizeClaimed").html(lastClosedRoundData.prizeClaimed);
    });
  },

  skipRound: function() {
    var instance;
    return ContractAbstraction.deployed().then(function(_instance){
      instance = _instance;
      return instance.skipRound({from: account, gas: 200000});
    }).then(function(result) {
      console.log("round skipped")
      console.log(result);
      self.setStatus("Transaction complete!");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  toggleSkipDisplay: function() {
    var skip = $("#skip");
    if(testMode){
      skip.show();
    } else {
      skip.hide();
    }
  },

  /*setMode: function() {
    testMode = $("#testModeCheckbox").is(":checked");
    self.toggleSkipDisplay();
    if (testMode == true){
      ContractAbstraction = TestHelpers;
      console.log("test mode");
    } else {
      ContractAbstraction = LowestUniqueNumberGame;
      console.log("game mode");
    }
  },*/

  calculateDecoy: function() {
    var numberPrice = rules.numberPrice;
    $("#sendDecoyInput").val(numberPrice * Math.floor(Math.random() * 100));
    self.calculatePrice();
  },

  calculatePrice: function() {
    if($("#sendNumberInput").val() && $("#sendDecoyInput").val()) {
      var numberPrice = parseFloat(rules.numberPrice);
      var number = parseFloat($("#sendNumberInput").val());
      var decoy = parseFloat($("#sendDecoyInput").val());
      $("#sendTransactionPrice").html((number * numberPrice + decoy).toFixed(Math.ceil(Math.abs(getBaseLog(10, numberPrice)))) + " ETH");
    }
  },

  watchEvents: function() {
    var feedTable = $("#liveFeed")[0];
    var helloWorld;
    ContractAbstraction.deployed().then(function(instance) {
      helloWorld = instance;
      var allEvents = helloWorld.allEvents();

      // watch for changes
      allEvents.watch(function(error, result){
        if (!error){
          var eventType = result.event;
          if (eventType == "numberSubmitted"){
            tableHelper.addDataRow(feedTable, ["Number Submitted", result.args.sender.substr(0, 9) + "...", "Hash: " + result.args.hash.substr(0, 9) + "..."]);
          }

          if (eventType == "prizeClaimed"){
            tableHelper.addDataRow(feedTable, ["Prize Claimed", result.args.sender.substr(0, 9) + "...", "Prize: " + web3.fromWei(result.args.prize, 'ether') + " ETH"]);
          }

          if (eventType == "numberUncovered"){
            tableHelper.addDataRow(feedTable, ["Number Uncovered", result.args.sender.substr(0, 9) + "...", "Number: " + result.args.number]);
          }

          if (eventType == "prizeRecycled"){
            tableHelper.addDataRow(feedTable, ["Prize Recycled", "", "Value: " + web3.fromWei(result.args.netValue, 'ether') + " ETH"]);
          }

          if (eventType == "prizePumped"){
            tableHelper.addDataRow(feedTable, ["Prize Pumped", result.args.sender.substr(0, 9), "Value: " + web3.fromWei(result.args.val(), 'ether') + " ETH"]);
          }

          if (eventType == "newRoundStarted"){
            tableHelper.addDataRow(feedTable, ["New Round Started", "", ""]);
          }
          tableHelper.limitRows(feedTable, 10);
          console.log("event caught")
          console.log(result);
        } else {
          console.log(error);
        }
      });
    });
  }

};

$(window).on('load', function() {
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

  App.watchEvents();
});
