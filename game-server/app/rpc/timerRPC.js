"use strict";
const TAG = "timerRPC.js";
const rpcConfig = require("../shared/rpcConfig");
const gamePlayToRPCGame = rpcConfig.gamePlayToRPCGame;

var exp = module.exports;

exp.rpcGamePayCoin = function(gamePlay, roomId, orderData, next){
    var rpc = gamePlayToRPCGame[gamePlay];
    if (rpc){
        rpc.timerToPayGameCoin({roomId: roomId}, roomId, orderData, next);
    }else{
        next(new Error("无效的玩法"));
    }
}