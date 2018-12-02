"use strict";
const TAG = "homeRPC.js";
const rpcConfig = require("../shared/rpcConfig");
const pomelo = require("pomelo");
const rpc = pomelo.app.rpc;
const rpcTimer = rpc.timer.timerRemote;

const gamePlayToRPCGame = rpcConfig.gamePlayToRPCGame;

var exp = module.exports;

exp.rpcGameJoinRoom = function(gamePlay, roomId, userId, serverId, nextFunc){
    var rpc = gamePlayToRPCGame[gamePlay];
    if (rpc){
        rpc.homeToJoinRoom({roomId: roomId}, roomId, userId, serverId, nextFunc);
    }else{
        next(new Error("无效的玩法"));
    }
}

exp.rpcGameRechargeCoin = function(gamePlay, roomId, userId, next){
    var rpc = gamePlayToRPCGame[gamePlay];
    if (rpc){
        rpc.homeToRechargeCoin({roomId: roomId}, roomId, userId, next);
    }else{
        next(new Error("无效的玩法"));
    }
}

exp.rpcGameListPublicRoom = function(gamePlay, roomId, next){
    var rpc = gamePlayToRPCGame[gamePlay];
    if (rpc){
        rpc.homeToListPublicRoom({roomId: roomId}, next);
    }else{
        next(new Error("无效的玩法"));
    }
}

exp.rpcGameMatchRoom = function(gamePlay, roomId, userId, msg, serverId, next){
    var rpc = gamePlayToRPCGame[gamePlay];
    if (rpc){
        rpc.homeToMatchRoom({roomId: roomId}, userId, msg, serverId, next);
    }else{
        next(new Error("无效的玩法"));
    }
}

exp.rpcGameCreateRoom = function(gamePlay, roomId, userId, serverId, rule, next){
    var rpc = gamePlayToRPCGame[gamePlay];
    if (rpc){
        rpc.homeToCreateRoom({roomId: roomId}, roomId, userId, serverId, rule, next);
    }else{
        next(new Error("无效的玩法"));
    }
}

exp.rpcTimerBroadcastNotice = function(notice, next){
    var notify = function(){
        rpcTimer.homeToBroadcastNotice({}, notice, function(err, data){
            console.log(TAG, "editNoticeBoard notify", err, data);
            if (err){
                return setTimeout(notify, 3000);
            }
            if (data.code != 0){
                setTimeout(notify, 3000);
            }
        });
    }
    notify();
}

exp.rpcTimerQueryRechargeResult = function(orderId){
    rpcTimer.homeToTimingQueryRechargeResult({}, orderId, ()=>{});
}