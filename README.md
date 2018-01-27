# Lowest Unique Number Game

## The game

The point of this game is to guess the lowest unique number of a round. For example if the numbers in the round are: 1, 1, 3, 4, 6:

- First we erase all the numbers which are present more than once
- Now we get 3, 4, 6
- The winner will be the smallest of the remaining numbers, so 3

Every player has to pay a small amount of ethers, when submitting their number, this amount depends on the number, the bigger it is, the more you have to pay. The most of the collective ether payed in a round will be the prize for the winner of the round.

## Hiding the numbers

The Ethereum blockchain and therefore the the data and the transactions of an application built on it are readable by anyone. But in this game we need to hide the numbers guessed, so we had to employ a little trick: Encrypting the numbers with a passwod given by the player. Thats why we need a separate "send number" and "uncover number" phase in the game. When sending the encrypted number we also need to add a tiny decoy ether value to hide the actual transaction value which could be used to deduce the number.
How to play

The numbers of a round are first sumbitted with password encryption. After the given round ends (one round is one day by default) it's uncover phase starts which lasts for the same time. During the uncover round players have to uncover their numbers with the password they have given. At the end of the uncover phase the winner is determined, and they can claim their prize. 

This is only on the ropsten testnet yet you can find the (very crude) frontend and try it at:
https://1up8192.github.io/sng/ropsten/

You can run tests with `truffle test`
