"use_strict";
const TAG = "coinKengPlayer.js";
const errcode = require("../../shared/errcode");
const constant = require("../../shared/constant");
const basePlayer = require("../base/player");

var CoinKengPlayer = function(){
    basePlayer.call(this);
    this.discardStat = 0;    //弃牌状态
    this.betCoin = -1;        //下注金币
    this.roundCoin = 0;      //本轮金币
    this.totalCoin = 0;      //本局金币
    this.betCoinData = {};
    this.cardInHand = [];    //手里的牌
    this.coinArr = [];
}

module.exports = CoinKengPlayer;

var temp = function(){};
temp.prototype = basePlayer.prototype;
CoinKengPlayer.prototype = new temp();

var player = CoinKengPlayer.prototype;

player.setHandCard = function(handCard){
    this.cardInHand = handCard;
}

player.setDiscardStat = function(stat){
    this.discardStat = stat;
}

player.setBetData = function(coin, betState, round, operation){
    if (coin > 0){
        this.roundCoin += coin;
        this.totalCoin += coin;
        this.coinNum -= coin;
        this.coinArr.push(coin);
    }
    this.betCoin = coin;
    this.betCoinData = {coin, betState, round, operation};
}

player.isHaveA = function(){
    var cardInHand = this.cardInHand;
    var len = cardInHand.length;
    if (len == 3 && cardInHand[len - 1] % 100 == 15){
        return true;
    }
    
    return false;
}

player.clearOneRunPlayer = function(){
    var player = this;
    player.readyStat = 0;
    player.discardStat = 0;
    player.cardInHand = [];
    player.betCoin = -1;
    player.roundCoin = 0;
    player.totalCoin = 0;
    player.betCoinData = {};
    player.coinArr = [];
}

player.getClientPlayerData = function(){
    var curPlayer = this;
    return {
        userId: curPlayer.userId,
        seatIdx: curPlayer.seatIdx,
        sex: curPlayer.sex,
        location: curPlayer.location,
        userNo: curPlayer.userNo,
        nickname:  curPlayer.nickname,
        loginIp: curPlayer.loginIp,
        userIcon: curPlayer.userIcon,
        clientPlat: curPlayer.clientPlat,
        coinNum: curPlayer.coinNum,
        readyStat: curPlayer.readyStat,
        discardStat: curPlayer.discardStat,
        roundCoin: curPlayer.roundCoin,
        totalCoin: curPlayer.totalCoin,
        betCoinData: curPlayer.betCoinData,
        cardInHand: curPlayer.cardInHand
    };
}