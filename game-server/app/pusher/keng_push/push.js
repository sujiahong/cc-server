"use strict";
const TAG = "keng_room_push.js";
const async = require("async");
const constant = require("../../shared/constant");
const errcode = require("../../shared/errcode");
const pomelo = require("pomelo");
var channelService = pomelo.app.get("channelService");
var backendService = pomelo.app.get("backendSessionService");

var exp = module.exports;

exp.pushBetCoin = function(room, userId, msg, stakeId, next){
    try{
        var pushData = {route: "onBetCoin", userId: userId, 
        coinData: {coin: msg.coin, operation: msg.operation}};
        pushData.operateId = room.operateId;
        pushData.stakeId = stakeId;
        pushData.betCoinState = room.betCoinStat;
        var len = room.appendIdArr.length;
        if (len > 0){
            pushData.firstAppendId = room.appendIdArr[0];
        }else{
            pushData.firstAppendId = "";
        }
        var uidsidArr = [];
        for (var uid in room.players){
            uidsidArr.push({uid: uid, sid: room.players[uid].frontServerId});
        }
        for (var uid in room.witnessPlayers){
            uidsidArr.push({uid: uid, sid: room.witnessPlayers[uid].frontServerId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushBetCoin:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushBetCoin: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushBetCoin: error", e);
    }
}

exp.pushOneCard = function(room, next){
    try{
        let pushData = {route: "onOneCard"};
        pushData.firstId = room.getFirstId();
        pushData.startId = room.getStartId();
        pushData.gongzhang = room.gongzhang;
        pushData.gongzhangUIdArr = room.gongzhangUIdArr;
        var uidsidArr = [];
        var playerHandData = {};
        for (var uid in room.players){
            let player = room.players[uid];
            if (player.readyStat == 1 && player.discardStat == 0){
                let handCard = player.cardInHand;
                playerHandData[uid] = handCard[handCard.length-1];
            }
            uidsidArr.push({uid: uid, sid: player.frontServerId});
        }
        pushData.playerHandData = playerHandData;
        for (var uid in room.witnessPlayers){
            uidsidArr.push({uid: uid, sid: room.witnessPlayers[uid].frontServerId});
        }
        channelService.pushMessageByUids(pushData, uidsidArr, function(err){
            console.warn(TAG, "pushOneCard:  channelService.pushMessageByUids: ", err);
            next(null, {code: errcode.OK});
        });
    }catch(e){
        console.error(TAG, "pushOneCard: error", e);
    }
}

exp.pushDiscard = function(room, userId, stakeId, next){
    try{
        var pushData = {route: "onDiscard", userId: userId};
        pushData.operateId = room.operateId;
        pushData.stakeId = stakeId;
        pushData.betCoinState = room.betCoinStat;
        var uidsidArr = [];
        for (var uid in room.players){
            uidsidArr.push({uid: uid, sid: room.players[uid].frontServerId});
        }
        for (var uid in room.witnessPlayers){
            uidsidArr.push({uid: uid, sid: room.witnessPlayers[uid].frontServerId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushDiscard:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushDiscard: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushDiscard: error", e);
    }
}

exp.pushResult = function(room, result, next){
    try{
        var pushData = {route: "onResult", result: result};
        pushData.languoState = room.noWinnerStat ? 1 : 0;
        var uidsidArr = [];
        for (var uid in room.players){
            uidsidArr.push({uid: uid, sid: room.players[uid].frontServerId});
        }
        for (var uid in room.witnessPlayers){
            uidsidArr.push({uid: uid, sid: room.witnessPlayers[uid].frontServerId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushResult:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushResult: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushResult:  error: ", e);
    }
}