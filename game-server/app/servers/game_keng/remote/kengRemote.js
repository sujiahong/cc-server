"use_strict";
const TAG = "kengRemote.js";
const kengGameMgr = require("../../../game_logic/coin_keng/gameKengMgr");
const playConfig = require("../../../shared/playConfig");

if (!global.g_kengGameMgr){
    global.g_kengGameMgr = new kengGameMgr();
}

module.exports = function(app){
    return new KengRemote(app);
}

var KengRemote = function(app){
    this.app = app;
}

var remote = KengRemote.prototype;

remote.connectorToOffline = function(roomId, userId, next){
    g_kengGameMgr.playerOffline(roomId, userId, next);
}

remote.connectorToOnline = function(roomId, userId, serverId, next){
    g_kengGameMgr.playerOnline(roomId, userId, serverId, next);
}

remote.homeToCreateRoom = function(roomId, userId, serverId, rule, next){
    g_kengGameMgr.createRoom(roomId, userId, serverId, rule, next);
}
/////
remote.homeToJoinRoom = function(roomId, userId, serverId, next){
    g_kengGameMgr.joinRoom(roomId, 4, userId, serverId, next);
}

remote.homeToMatchRoom = function(userId, msg, serverId, next){
    g_kengGameMgr.matchRoom(userId, msg, serverId, next);
}

/////
remote.homeToListPublicRoom = function(next){
    g_kengGameMgr.listPublicRoom(next);
}
////
remote.timerToPayGameCoin = function(roomId, orderData, next){
    g_kengGameMgr.payGameCoin(roomId, orderData, next);
}

remote.homeToRechargeCoin = function(roomId, userId, next){
    g_kengGameMgr.rechargeCoin(roomId, userId, next);
}

remote.timerToCreateRoom = function(roomId, baseCoin, next){
    var rule = playConfig.gamePlayToRule[4];
    rule.baseCoin = baseCoin;
    g_kengGameMgr.createSystemRoom(roomId, rule, next);
}