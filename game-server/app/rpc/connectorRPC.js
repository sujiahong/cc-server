"use strict";
const TAG = "connectorRPC.js";
const rpcConfig = require("../shared/rpcConfig");
const gamePlayToRPCGame = rpcConfig.gamePlayToRPCGame;

var exp = module.exports;

exp.rpcGameOnline = function(gamePlay, roomId, userId, serverId, next){
    var rpc = gamePlayToRPCGame[gamePlay];
    if (rpc){
        rpc.connectorToOnline({roomId: roomId}, roomId, userId, serverId, next);
    }else{
        next(new Error("无效的玩法"));
    }
}

exp.rpcGameOffline = function(gamePlay, roomId, userId, next){
    var rpc = gamePlayToRPCGame[gamePlay];
    if (rpc){
        rpc.connectorToOffline({roomId: roomId}, roomId, userId, next);
    }else{
        next(new Error("无效的玩法"));
    }
}