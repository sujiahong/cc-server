"use_strict";
const TAG = "coinPaoPlayer.js";
const errcode = require("../../shared/errcode");
const basePlayer = require("../base/player");
const constant = require("../../shared/constant");

var CoinPaoPlayer = function(opts){
    basePlayer.call(this);
    this.trusteeStat = 0;   //托管 0不托管  1托管
    this.robScore = -4;     //大于0叫分，小于0叫地主
    this.cardInHand = [];   //手里的牌
    this.cardInDesk = [];   //打出去的牌
    this.coinIncr = 0;
    this.valHandCardMap = null;
}

module.exports = CoinPaoPlayer;
var temp = function(){};
temp.prototype = basePlayer.prototype;
CoinPaoPlayer.prototype = new temp();

var player = CoinPaoPlayer.prototype;

player.setRobScore = function(score){
    this.robScore = score;
}

player.rmvCardsFromHand = function(cards){
    var cardInHand = this.cardInHand;
    for (var i in cards){
        var idx = getIndexInHand(cardInHand, cards[i]);
        cardInHand.splice(idx, 1);
    }
}

var getIndexInHand = function(cardInHand, cardKeyId){
    for (var i = 0, len = cardInHand.length; i < len; ++i){
        if (cardInHand[i] == cardKeyId){
            return i;
        }
    }
    return -1;
};

player.appendAuxiliaryCard = function(cards){
    for(var i = 0, len = cards.length; i < len; ++i){
        this.cardInHand.push(cards[i]);
    }
}

player.putCardInDesk = function(cards){
    this.cardInDesk.push(cards);
}

player.setTrustee = function(stat){
    this.trusteeStat = stat;
}

player.clearOneRunPlayer = function(){
    var player = this;
    player.readyStat = 0;
    player.cardInHand = [];
    player.cardInDesk = [];   
    player.trusteeStat = 0;
    player.robScore = -4;
    player.coinIncr = 0;
    player.valHandCardMap = null;
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
        trusteeStat: curPlayer.trusteeStat,
        cardInHand: curPlayer.cardInHand,
        cardInDesk: curPlayer.cardInDesk
    };
}
