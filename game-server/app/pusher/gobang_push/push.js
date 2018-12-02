"use strict";
const TAG = "gobang_push.js";
const constant = require("../../shared/constant");
const errcode = require("../../shared/errcode");
const pomelo = require("pomelo");
var channelService = pomelo.app.get("channelService");
var backendService = pomelo.app.get("backendSessionService");

var exp = module.exports;

exp.pushJoinGobang = function(room, entrantId, next){
    try{
        var pushData = {route: "onJoinGobang", playerData: {}};
        var entrant = null;
        var uidsidArr = [];
        for (var uid in room.players){
            var player = room.players[uid];
            if (player.userId != entrantId){
                uidsidArr.push({uid: player.userId, sid: player.serverId});
            }else if(player.userId == entrantId){
                entrant = player;
            }
        }
        var playerData = pushData.playerData;
        playerData.userId = entrantId;
        playerData.userNo = entrant.userNo;
        playerData.seatIdx = entrant.seatIdx;
        playerData.nickname = entrant.nickname;
        playerData.userIcon = entrant.userIcon;
        playerData.coinNum = entrant.coinNum;
        playerData.serverId = entrant.serverId;
        console.log(TAG, "加入房间者ID：", entrantId, uidsidArr);
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushJoinGobang:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK, roomData: room});
            });
        }else{
            console.warn(TAG, "pushJoinGobang: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK, roomData: room});
        }
    }catch(e){
        console.error(TAG, "pushJoinGobang: error: ", e);
    }
}

exp.pushGobang = function(room, type, data, next){
    try{
        var pushData = {route: "onGobang", type: type, data: data};
        if (type == 1){
            pushData.starterId = room.starterId;
        }
        var uidsidArr = [];
        for (var uid in room.players){
            var player = room.players[uid];
            uidsidArr.push({uid: player.userId, sid: player.serverId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushGobang:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushGobang: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushGobang: error: ", e);
    }
}

exp.pushExitGobang = function(room, userId, serverId, next){
    try{
        var pushData = {route: "onExitGobang", userId: userId};
        var uidsidArr = [];
        for (var uid in room.players){
            var player = room.players[uid];
            if (player.userId != userId){
                uidsidArr.push({uid: player.userId, sid: player.serverId});
            }
        }
        console.log(TAG, uidsidArr, "离开者Id：", userId, serverId);
        if (serverId){
            backendService.getByUid(serverId, userId, function(err, sessions){
                console.log(TAG, userId, "###### _setUserSession %$%$%$%$%%", err, sessions)
                if (sessions && sessions.length > 0){
                    var session = sessions[0];
                    session.set("roomId", "");
                    session.set("gamePlay", constant.GAME_PLAY.none);
                    session.pushAll();
                }
                if (uidsidArr.length > 0){
                    channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                        console.warn(TAG, "pushExit:  channelService.pushMessageByUids: ", err);
                        next(null, {code: errcode.OK});
                    });
                }else{
                    console.warn(TAG, "pushExit: 没有其他玩家可以推送消息");
                    next(null, {code: errcode.OK});
                }
            });
        }else{
            if (uidsidArr.length > 0){
                channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                    console.warn(TAG, "pushExit:  channelService.pushMessageByUids: ", err);
                    next(null, {code: errcode.OK});
                });
            }else{
                console.warn(TAG, "pushExit: 没有其他玩家可以推送消息");
                next(null, {code: errcode.OK});
            }
        }
    }catch(e){
        console.error(TAG, "pushExit: error: ", e);
    }
}

exp.pushGobangLineStat = function(room, userId, stat, next){
    try{
        var pushData = {route: "onGobangLineStat"};
        pushData.userId = userId;
        pushData.lineStat = stat;
        var uidsidArr = [];
        for (var uid in room.players){
            var player = room.players[uid];
            if (player.userId != userId){
                uidsidArr.push({uid: player.userId, sid: player.serverId});
            }
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushGobangLineStat:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushGobangLineStat: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushGobangLineStat:  error: ", e);
    }
}