"use strict";
const TAG = "gameGobangRoom.js";
const constant = require("../../shared/constant");

var GameGobangRoom = function(opts){
    this.roomId = "";
    this.creatorId = "";
    this.gamePlay =  0;
    this.startStamp = 0; //开始时间戳
    this.endStamp = 0; //结束时间戳
    this.baseCoin = 0;
    this.players = {};
    this.starterId = "";
    this.gobangSteps = [];
    this.winnerId = "";

    this.operationDataArr = [];  ///操作流水
    if (opts){
        this.roomId = opts.roomId;
        this.creatorId = opts.creatorId;
        this.gamePlay = opts.gamePlay;
        this.baseCoin = opts.baseCoin;
        this.players = opts.players;
        this.starterId = opts.starterId;
        this.gobangSteps = opts.gobangSteps;
        this.winnerId = opts.winnerId;
    }
}

module.exports = GameGobangRoom;

GameGobangRoom.prototype.init = function(roomId, creatorId){
    this.roomId = roomId;
    this.creatorId = creatorId;
    this.gamePlay = constant.GAME_PLAY.gobang;
}

GameGobangRoom.prototype.getPlayerByUId = function(userId){
    return this.players[userId];
}

GameGobangRoom.prototype.getPlayerCount = function(){
    var count = 0;
    for (var uid in this.players){
        count++;
    }
    return count;
}

GameGobangRoom.prototype.getSeatIdx = function(){
    for (var uid in this.players){
        var player = this.players[uid];
        if (player.seatIdx == 1){
            return 2;
        }else{
            return 1;
        }
    }
    return 1;
}

GameGobangRoom.prototype.computeResult = function(){
    this.endStamp = Date.now();
    var transactionData = {reason: 1, timestamp: Date.now()};
    var baCoin = this.baseCoin;
    for (var uid in this.players){
        var player = this.players[uid];
        if (player.userId != this.winnerId){
            if (player.coinNum < this.baseCoin){
                baCoin = player.coinNum;
            }
            transactionData.sourceCoin = player.coinNum;
        }else{
            transactionData.targetCoin = player.coinNum;
        }
    }
    transactionData.tradingCoin = baCoin;
    for (var uid in this.players){
        var player = this.players[uid];
        if (player.userId == this.winnerId){
            player.coinNum += baCoin;
            transactionData.targetUserId = uid;
            transactionData.targetUserNo = player.userNo;
            transactionData.afterTargetCoin = player.coinNum;
        }else{
            player.coinNum -= baCoin;
            transactionData.sourceUserId = uid;
            transactionData.sourceUserNo = player.userNo;
            transactionData.afterSourceCoin = player.coinNum;
        }
    }
    return transactionData;
}

GameGobangRoom.prototype.leaveRoom = function(userId){
    delete this.players[userId];
}

GameGobangRoom.prototype.cleanRoom = function(){
    this.baseCoin = 0;
    this.starterId = "";
    this.gobangSteps = [];
    this.winnerId = "";
}