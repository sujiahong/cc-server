"use_strict";
const TAG = "coinNiuPlayer.js";
const errcode = require("../../shared/errcode");
const basePlayer = require("../base/player");
const constant = require("../../shared/constant");

var CoinNiuPlayer = function(opts){
    basePlayer.call(this);
    this.flopStat = 0;
    this.multiple = -1;  //叫的倍数
    this.cardInHand = [];  //手里的牌
    this.niuInHand = {};
}

module.exports = CoinNiuPlayer;

var temp = function(){};
temp.prototype = basePlayer.prototype;
CoinNiuPlayer.prototype = new temp();

var player = CoinNiuPlayer.prototype;

player.setHandCard = function(handCard){
    this.cardInHand = handCard;
}

player.robMultiple = function(multi){
    this.multiple = multi;
}

player.setFlopStat = function(stat){
    this.flopStat = stat;
}

player.clearOneRunPlayer = function(){
    var player = this;
    player.readyStat = 0;
    player.flopStat = 0;
    player.cardInHand = [];
    player.niuInHand = {};
    player.multiple = -1;  //叫的倍数
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
        flopStat: curPlayer.flopStat,
        multiple: curPlayer.multiple,
        cardInHand: curPlayer.cardInHand
    };
}