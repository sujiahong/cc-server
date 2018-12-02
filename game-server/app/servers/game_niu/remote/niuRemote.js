"use_strict";
const TAG = "niuRemote.js";
const niuGameMgr = require("../../../game_logic/coin_douniu/gameNiuMgr");
const playConfig = require("../../../shared/playConfig");

if (!global.g_niuGameMgr){
    global.g_niuGameMgr = new niuGameMgr();
}

module.exports = function(app){
    return new NiuRemote(app);
}

var NiuRemote = function(app){
    this.app = app;
}

var remote = NiuRemote.prototype;

remote.connectorToOffline = function(roomId, userId, next){
    g_niuGameMgr.playerOffline(roomId, userId, next);
}

remote.connectorToOnline = function(roomId, userId, serverId, next){
    g_niuGameMgr.playerOnline(roomId, userId, serverId, next);
}

remote.homeToCreateRoom = function(roomId, userId, serverId, rule, next){
    g_niuGameMgr.createRoom(roomId, userId, serverId, rule, next);
}
/////
remote.homeToJoinRoom = function(roomId, userId, serverId, next){
    g_niuGameMgr.joinRoom(roomId, 1, userId, serverId, next);
}

remote.homeToMatchRoom = function(userId, msg, serverId, next){
    g_niuGameMgr.matchRoom(userId, msg, serverId, next);
}

/////
remote.homeToListPublicRoom = function(next){
    g_niuGameMgr.listPublicRoom(next);
}
/////
remote.timerToPayGameCoin = function(roomId, orderData, next){
    g_niuGameMgr.payGameCoin(roomId, orderData, next);
}

remote.homeToRechargeCoin = function(roomId, userId, next){
    g_niuGameMgr.rechargeCoin(roomId, userId, next);
}

remote.timerToCreateRoom = function(roomId, baseCoin, next){
    var rule = playConfig.gamePlayToRule[1];
    rule.baseCoin = baseCoin;
    g_niuGameMgr.createSystemRoom(roomId, rule, next);
}