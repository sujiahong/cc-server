"use_strict";
const TAG = "coinJinHuaPlayer.js";
const errcode = require("../../shared/errcode");
const basePlayer = require("../base/player");
const constant = require("../../shared/constant");


var CoinJinHuaPlayer = function(opts){
    basePlayer.call(this);
    this.seeCardStat = 0;
    this.discardStat = 0;    //弃牌状态
    this.totalCoin = 0;      //本局金币
    this.betCoinData = {};
    this.cardInHand = [];    //手里的牌
    this.coinArr = [];
    this.handData = null;
}

module.exports = CoinJinHuaPlayer;

var temp = function(){};
temp.prototype = basePlayer.prototype;
CoinJinHuaPlayer.prototype = new temp();

var player = CoinJinHuaPlayer.prototype;

player.setHandCard = function(handCard){
    this.cardInHand = handCard;
}

player.setDiscardStat = function(stat){
    this.discardStat = stat;
}

player.setSeeCardStat = function(stat){
    this.seeCardStat = stat;
}

player.setBetData = function(coin, operation){
    if (coin > 0){
        this.totalCoin += coin;
        this.coinNum -= coin;
        this.coinArr.push(coin);
    }
    this.betCoinData = {coin, operation};
}

player.clearOneRunPlayer = function(){
    var player = this;
    player.readyStat = 0;
    player.discardStat = 0;
    player.seeCardStat = 0;
    player.cardInHand = [];
    player.betCoinData = {};
    player.totalCoin = 0;
    player.coinArr = [];
    player.handData = null;
}

player.getClientPlayerData = function(){
    var curPlayer = this;
    return {
        userId: curPlayer.userId,
        seatIdx: curPlayer.seatIdx,
        sex: curPlayer.sex,
        location: curPlayer.location,
        userNo: curPlayer.userNo,
        nickname: curPlayer.nickname,
        loginIp: curPlayer.loginIp,
        userIcon: curPlayer.userIcon,
        clientPlat: curPlayer.clientPlat,
        coinNum: curPlayer.coinNum,
        readyStat: curPlayer.readyStat,
        seeStat: curPlayer.seeCardStat,
        discardStat: curPlayer.discardStat,
        totalCoin: curPlayer.totalCoin,
        betCoinData: curPlayer.betCoinData,
        cardInHand: curPlayer.cardInHand
    };
}