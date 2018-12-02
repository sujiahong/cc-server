"use strict";
const TAG = "jin_room_push.js";
const async = require("async");
const constant = require("../../shared/constant");
const errcode = require("../../shared/errcode");
const pomelo = require("pomelo");
var channelService = pomelo.app.get("channelService");
var backendService = pomelo.app.get("backendSessionService");

var exp = module.exports;

exp.pushBetCoin = function(room, userId, msg, next){
    try{
        var pushData = {route: "onBetCoin", userId: userId,
        coinData: {coin: msg.coin, operation: msg.operation}};
        pushData.operateId = room.operateId;
        pushData.roundCount = room.roundCount;
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

exp.pushDiscard = function(room, userId, next){
    try{
        var pushData = {route: "onDiscard", userId: userId};
        pushData.operateId = room.operateId;
        pushData.roundCount = room.roundCount;
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

exp.pushSeeCard = function(room, userId, next){
    try{
        var pushData = {route: "onSeeCard", userId: userId};
        var uidsidArr = [];
        var players = room.players;
        for (var uid in players){
            uidsidArr.push({uid: uid, sid: players[uid].frontServerId});
        }
        var witnessPlayers = room.witnessPlayers;
        for (var uid in witnessPlayers){
            uidsidArr.push({uid: uid, sid: witnessPlayers[uid].frontServerId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushSeeCard:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK, cards: players[userId].cardInHand});
            });
        }else{
            console.warn(TAG, "pushSeeCard: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK, cards: players[userId].cardInHand});
        }
    }catch(e){
        console.error(TAG, "pushSeeCard:  error: ", e);
    }
}

exp.pushCompareCard = function(room, userId, comparedData, next){
    try{
        var pushData = {route: "onCompareCard", winnerId: userId, comparedData: comparedData};
        var uidsidArr = [];
        var players = room.players;
        for (var uid in players){
            uidsidArr.push({uid: uid, sid: players[uid].frontServerId});
        }
        var witnessPlayers = room.witnessPlayers;
        for (var uid in witnessPlayers){
            uidsidArr.push({uid: uid, sid: witnessPlayers[uid].frontServerId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushCompareCard:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushCompareCard: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushCompareCard:  error: ", e);
    }
}

exp.pushResult = function(room, result, next){
    try{
        var pushData = {route: "onResult", result: result};
        var uidsidArr = [];
        var players = room.players;
        for (var uid in players){
            uidsidArr.push({uid: uid, sid: players[uid].frontServerId});
        }
        var witnessPlayers = room.witnessPlayers;
        for (var uid in witnessPlayers){
            uidsidArr.push({uid: uid, sid: witnessPlayers[uid].frontServerId});
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