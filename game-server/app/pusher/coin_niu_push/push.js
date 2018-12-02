"use strict";
const TAG = "niu_room_push.js";
const async = require("async");
const constant = require("../../shared/constant");
const errcode = require("../../shared/errcode");
const pomelo = require("pomelo");
var channelService = pomelo.app.get("channelService");
var backendService = pomelo.app.get("backendSessionService");

var exp = module.exports;

exp.pushMultiple = function(room, robId, multiType, next){
    try{
        var pushData = {route: "onMultiple"};
        pushData.userId = robId;
        pushData.multiType = multiType;
        pushData.multi = room.players[robId].multiple;
        pushData.bankerId = room.bankerId;
        if (multiType == 1 && room.bankerId){
            for (var uid in room.players){
                var player = room.players[uid];
                if(uid == room.bankerId){
                    if(player.multiple == 0){
                        player.multiple = 1;
                    }
                }else{
                    player.multiple = -1;  //叫的倍数
                }
            }
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
                console.warn(TAG, "pushMultiple:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushMultiple: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushMultiple: error", e);
    }
}

exp.pushOneCard = function(room, next){
    try{
        let pushData = {route: "onOneCard"};
        var parallelFuncArr = [];
        for(let uid in room.players){
            let player = room.players[uid];
            let handCard = player.cardInHand;            
            var func = function(cb){
                var playerHandData = {};
                for (var id in room.players){
                    playerHandData[id] = [];
                    if (id == uid){
                        playerHandData[id] = handCard[handCard.length-1];
                    }else{
                        playerHandData[id] = 1000;
                    }
                }
                pushData.playerHandData = playerHandData;
                channelService.pushMessageByUids(pushData, [{uid: uid, sid: player.frontServerId}], cb);
            }
            parallelFuncArr.push(func);
        }
        for (let wuid in room.witnessPlayers){
            let player = room.witnessPlayers[wuid];
            var func = function(cb){
                var playerHandData = {};
                for (var id in room.players){
                    playerHandData[id] = 1000;
                }
                pushData.playerHandData = playerHandData;
                channelService.pushMessageByUids(pushData, [{uid: wuid, sid: player.frontServerId}], cb);
            }
            parallelFuncArr.push(func);
        }
        async.parallel(parallelFuncArr, function(err, ret){
            console.warn(TAG, "pushOneCard:  channelService.pushMessageByUids: ", err);
            next(null, {code: errcode.OK});
        });
    }catch(e){
        console.error(TAG, "pushOneCard: error", e);
    }
}

exp.pushFlop = function(room, playerHandData, next){
    try{
        var pushData = {route: "onFlop", playerHandData: {}, niuData: {type: 0, niu: [], aux: []}};
        for (var uid in playerHandData){
            var handArr = playerHandData[uid];
            pushData.playerHandData[uid] = handArr[0];
            pushData.niuData.type = handArr[1].type;
            if (handArr[1].niu){
                pushData.niuData.niu = handArr[1].niu;
            }
            if (handArr[1].aux){
                pushData.niuData.aux = handArr[1].aux;
            }
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
                console.warn(TAG, "pushFlop:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushFlop: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushFlop: error", e);
    }
}

exp.pushResult = function(room, result, next){
    try{
        var pushData = {route: "onResult"};
        pushData.result = {};
        for (var uid in result){
            pushData.result[uid] = {
                niuType: result[uid].niuType,
                coinIncr: result[uid].coinIncr,
                coinNum: result[uid].coinNum,
                readyStat: 0
            };
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

