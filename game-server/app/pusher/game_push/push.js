"use strict";
const TAG = "game_push.js";
const constant = require("../../shared/constant");
const errcode = require("../../shared/errcode");
const pomelo = require("pomelo");
var channelService = pomelo.app.get("channelService");
var backendService = pomelo.app.get("backendSessionService");

var exp = module.exports;

exp.pushNotice = function(uidsidData, notice, next){
    try{
        var pushData = {route: "onGameNotice", notice: notice};
        var uidsidArr = [];
        for (var uid in uidsidData){
            uidsidArr.push({uid: uid, sid: uidsidData[uid]});
        }
        console.log(uidsidData)
        var len = uidsidArr.length;
        if (len > 0){
            var step = 20;
            var send = function(idx){
                var max = idx + step;
                if (len < max){
                    max = len;
                }
                var curUidSidArr = [];
                for (var i = idx; i < max; ++i){
                    curUidSidArr.push(uidsidArr[i]);
                }
                console.log(idx, step, len, max, curUidSidArr)
                channelService.pushMessageByUids(pushData, curUidSidArr, function(err){
                    console.warn(TAG, "pushNotice:  channelService.pushMessageByUids: ", err);
                    if (len <= max){
                        return next(null, {code: errcode.OK});
                    }
                    setTimeout(function(){
                        send(max);
                    }, 500);
                });
            }
            send(0);
        }else{
            console.warn(TAG, "pushNotice: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushNotice: error: ", e);
    }
}

exp.pushGameCoin = function(userId, serverId, data, next){
    try{
        var pushData = {route: "onGameCoin", data: data};
        var uidsidArr = [{uid: userId, sid: serverId}];
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushGameCoin:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushGameCoin: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushGameCoin: error: ", e);
    }
}

exp.pushFreeze = function(userId, serverId, stat, next){
    try{
        var pushData = {route: "onFreeze", state: stat};
        var uidsidArr = [{uid: userId, sid: serverId}];
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushFreeze:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushFreeze: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushFreeze: error: ", e);
    }
}

exp.pushRoomInvitation = function(userId, serverId, invitation, next){
    try{
        var pushData = {route: "onInvitation", invitation: invitation};
        var uidsidArr = [{uid: userId, sid: serverId}];
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushRoomInvitation:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushRoomInvitation: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushRoomInvitation: error: ", e);
    }
}

exp.pushRechargeResult = function(userId, serverId, res, next){
    try{
        var pushData = {route: "onGameRecharge", res: res};
        var uidsidArr = [{uid: userId, sid: serverId}];
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushRechargeResult:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushRechargeResult: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushRechargeResult: error: ", e);
    }
}

exp.pushJoinRoom = function(room, entrantId, next){
    try{
        var pushData = {route: "onJoinRoom"};
        var entrant = room.getWitnessPlayerByUid(entrantId);
        pushData.userId = entrantId;
        pushData.nickname = entrant.nickname;
        pushData.userIcon = entrant.userIcon;
        pushData.userNo = entrant.userNo;
        var uidsidArr = [];
        for (var uid in room.players){
            uidsidArr.push({uid: uid, sid: room.players[uid].frontServerId});
        }
        for (var uid in room.witnessPlayers){
            if (uid != entrantId){
                uidsidArr.push({uid: uid, sid: room.witnessPlayers[uid].frontServerId});
            }
        }
        console.log(TAG, "加入房间者ID：", entrantId, uidsidArr);
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushJoinRoom:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK, roomId: room.roomId});
            });
        }else{
            console.warn(TAG, "pushJoinRoom: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK, roomId: room.roomId});
        }
    }catch(e){
        console.error(TAG, "pushJoinRoom: error: ", e);
    }
}

exp.pushRoomData = function(room, userId, serverId, next){
    try{
        if (serverId){
            var pushData = {route: "onRoomData", roomData: room.getClientRoomData(userId)};
            var uidsidArr = [{uid: userId, sid: serverId}];
            if (uidsidArr.length > 0){
                channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                    console.warn(TAG, "pushRoomData:  channelService.pushMessageByUids: ", err);
                    next(null, {code: errcode.OK, roomId: room.roomId});
                });
            }else{
                console.warn(TAG, "pushRoomData: 没有其他玩家可以推送消息");
                next(null, {code: errcode.OK, roomId: room.roomId});
            }
        }else{
            console.warn(TAG, "pushRoomData: serverId 错误： ", serverId);
            next(null, {code: errcode.OK, roomId: room.roomId});
        }
    }catch(e){
        console.error(TAG, "pushRoomData: error: ", e);
    }
}

exp.pushReady = function(room, readyerId, next){
    try{
        var pushData = {route: "onReady"};
        pushData.userId = readyerId;
        var uidsidArr = [];
        for (var uid in room.players){
            if (uid != readyerId){
                uidsidArr.push({uid: uid, sid: room.players[uid].frontServerId});
            }
        }
        for (var uid in room.witnessPlayers){
            uidsidArr.push({uid: uid, sid: room.witnessPlayers[uid].frontServerId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushReady:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushReady: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushReady: error: ", e);
    }
}

exp.pushHandCard = function(room, next){
    try{
        var handCardDataArr = room.getAllClientHandData();
        for(var i = 0, len = handCardDataArr.length; i < len; ++i){
            var handData = handCardDataArr[i];
            var userId = handData.userId;
            var serverId = handData.serverId;
            console.log(TAG, "pushHandCard ", userId, serverId, handData.pushData);
            var pushData = handData.pushData;
            pushData.route = "onHandCard";
            channelService.pushMessageByUids(pushData, [{uid: handData.userId, sid: handData.serverId}], (err)=>{
                console.log(TAG, "pushHandCard:  channelService.pushMessageByUids: ", err);
            });
        }
        next(null, {code: errcode.OK});
    }catch(e){
        console.error(TAG, "pushHandCard: error: ", e);
    }
}

exp.pushTranspose = function(room, exitRoom, userId, serverId, next){
    try{
        var pushData = {route: "onTranspose", exitRoomId: exitRoom.roomId, joinRoomId: room.roomId};
        pushData.userId = userId;
        var player = room.getWitnessPlayerByUid(userId);
        pushData.nickname = player.nickname;
        pushData.userIcon = player.userIcon;
        pushData.userNo = player.userNo;
        var uidsidArr = [];
        for (var uid in exitRoom.players){
            uidsidArr.push({uid: uid, sid: exitRoom.players[uid].frontServerId});
        }
        for (var uid in exitRoom.witnessPlayers){
            uidsidArr.push({uid: uid, sid: exitRoom.witnessPlayers[uid].frontServerId});
        }
        for (var uid in room.players){
            uidsidArr.push({uid: uid, sid: room.players[uid].frontServerId});
        }
        for (var uid in room.witnessPlayers){
            uidsidArr.push({uid: uid, sid: room.witnessPlayers[uid].frontServerId});
        }
        console.log(TAG, "换桌者Id：", userId, serverId);
        if (serverId){
            getSessionByServerIdAndUId(serverId, userId, (session)=>{
                session.set("roomId", room.roomId);
                session.pushAll();
            });
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushTranspose:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK, roomData: room.getClientRoomData()});
            });
        }else{
            console.warn(TAG, "pushTranspose: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK, roomData: room.getClientRoomData()});
        }
    }catch(e){
        console.error(TAG, "pushTranspose: error: ", e);
    }
}

exp.pushExit = function(room, userId, serverId, next){
    try{
        var pushData = {route: "onExit"};
        pushData.userId = userId;
        var uidsidArr = [];
        for (var uid in room.players){
            uidsidArr.push({uid: uid, sid: room.players[uid].frontServerId});
        }
        for (var uid in room.witnessPlayers){
            uidsidArr.push({uid: uid, sid: room.witnessPlayers[uid].frontServerId});
        }
        console.log(TAG, "离开者Id：", userId, serverId);
        if (serverId){
            getSessionByServerIdAndUId(serverId, userId, (session)=>{
                session.set("roomId", "");
                session.set("gamePlay", constant.GAME_PLAY.none);
                session.pushAll();
            });
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
    }catch(e){
        console.error(TAG, "pushExit: error: ", e);
    }
}

var getSessionByServerIdAndUId = function(serverId, userId, next){
    console.log(TAG, "###### 开始 start getSessionByServerIdAndUId ", userId, serverId);
    var count = 0;
    var _get = function(){
        backendService.getByUid(serverId, userId, function(err, sessions){
            console.log(TAG, userId, "###### getSessionByServerIdAndUId ", err, sessions);
            if (err){
                count++;
                if (count < 5)
                    setTimeout(_get, 500);
            }
            if (sessions && sessions.length > 0){
                next(sessions[0]);
            }else{
                count++;
                if (count < 5)
                    setTimeout(_get, 500);
            }
        });
    }
    _get();
}

exp.pushSeat = function(room, userId, next){
    try{
        var pushData = {route: "onSeat"};
        var player = room.players[userId];
        var playerData = player.getClientPlayerData();
        pushData.playerData = playerData;
        var uidsidArr = [];
        for (var uid in room.players){
            if (uid != userId){
                uidsidArr.push({uid: uid, sid: room.players[uid].frontServerId});
            }
        }
        for (var uid in room.witnessPlayers){
            if (uid != userId){
                uidsidArr.push({uid: uid, sid: room.witnessPlayers[uid].frontServerId});
            }
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushSeat:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK, playerData: playerData});
            });
        }else{
            console.warn(TAG, "pushSeat: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK, playerData: playerData});
        }
    }catch(e){
        console.error(TAG, "pushSeat: error: ", e);
    }
}

exp.pushDestroy = function(userId, serverId, next){
    try{
        if (serverId){
            var pushData = {route: "onRoomDestroy"};
            var uidsidArr = [{uid: userId, sid: serverId}];
            getSessionByServerIdAndUId(serverId, userId, (session)=>{
                session.set("roomId", "");
                session.set("gamePlay", constant.GAME_PLAY.none);
                session.pushAll();
            });
            if (uidsidArr.length > 0){
                channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                    console.warn(TAG, "pushDestroy:  channelService.pushMessageByUids: ", err);
                    next(null, {code: errcode.OK});
                });
            }else{
                console.warn(TAG, "pushDestroy: 没有其他玩家可以推送消息");
                next(null, {code: errcode.OK});
            }
        }else{
            console.warn(TAG, "pushDestroy: serverId 错误： ", serverId);
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushDestroy: error: ", e);
    }
}

exp.pushLineStat = function(room, userId, stat, next){
    try{
        var pushData = {route: "onLineStat"};
        pushData.userId = userId;
        pushData.lineStat = stat;
        var uidsidArr = [];
        for (var uid in room.players){
            if (uid != userId){
                uidsidArr.push({uid: uid, sid: room.players[uid].frontServerId});
            }
        }
        for (var uid in room.witnessPlayers){
            if (uid != userId){
                uidsidArr.push({uid: uid, sid: room.witnessPlayers[uid].frontServerId});
            }
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushLineStat:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushLineStat: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushLineStat:  error: ", e);
    }
}

exp.pushChat = function(room, userId, msg, next){
    try{
        var pushData = {route: "onChat", userId: userId};
        pushData.type = msg.type;
        pushData.target = msg.target;
        pushData.message1 = msg.message1;
        pushData.message2 = msg.message2;
        var uidsidArr = [];
        for (var uid in room.players){
            uidsidArr.push({uid: uid, sid: room.players[uid].frontServerId});
        }
        for (var uid in room.witnessPlayers){
            uidsidArr.push({uid: uid, sid: room.witnessPlayers[uid].frontServerId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushChat:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushChat: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushChat:  error: ", e);
    }
}
