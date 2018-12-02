"use_strict";
const TAG = "paoRemote.js";
const paoGameMgr = require("../../../game_logic/coin_pao/gamePaoMgr");
const playConfig = require("../../../shared/playConfig");

if (!global.g_paoGameMgr){
    global.g_paoGameMgr = new paoGameMgr();
}

module.exports = function(app){
    return new Remote(app);
}

var Remote = function(app){
    this.app = app;
}

var remote = Remote.prototype;

remote.connectorToOffline = function(roomId, userId, next){
    g_paoGameMgr.playerOffline(roomId, userId, next);
}

remote.connectorToOnline = function(roomId, userId, serverId, next){
    g_paoGameMgr.playerOnline(roomId, userId, serverId, next);
}

remote.homeToCreateRoom = function(roomId, userId, serverId, rule, next){
    g_paoGameMgr.createRoom(roomId, userId, serverId, rule, next);
}
/////
remote.homeToJoinRoom = function(roomId, userId, serverId, next){
    g_paoGameMgr.joinRoom(roomId, 2, userId, serverId, next);
}

remote.homeToMatchRoom = function(userId, msg, serverId, next){
    g_paoGameMgr.matchRoom(userId, msg, serverId, next);
}

/////
remote.homeToListPublicRoom = function(next){
    g_paoGameMgr.listPublicRoom(next);
}
////
remote.timerToPayGameCoin = function(roomId, orderData, next){
    g_paoGameMgr.payGameCoin(roomId, orderData, next);
}

remote.homeToRechargeCoin = function(roomId, userId, next){
    g_paoGameMgr.rechargeCoin(roomId, userId, next);
}

remote.timerToCreateRoom = function(roomId, baseCoin, next){
    var rule = playConfig.gamePlayToRule[5];
    rule.baseCoin = baseCoin;
    g_paoGameMgr.createSystemRoom(roomId, rule, next);
}