"use_strict";
const TAG = "ddzRemote.js";
const ddzGameMgr = require("../../../game_logic/coin_ddz/gameCoinMgr");
const playConfig = require("../../../shared/playConfig");

if (!global.g_ddzGameMgr){
    global.g_ddzGameMgr = new ddzGameMgr();
}

module.exports = function(app){
    return new DDZRemote(app);
}

var DDZRemote = function(app){
    this.app = app;
}

var remote = DDZRemote.prototype;

remote.connectorToOffline = function(roomId, userId, next){
    g_ddzGameMgr.playerOffline(roomId, userId, next);
}

remote.connectorToOnline = function(roomId, userId, serverId, next){
    g_ddzGameMgr.playerOnline(roomId, userId, serverId, next);
}

remote.homeToCreateRoom = function(roomId, userId, serverId, rule, next){
    g_ddzGameMgr.createRoom(roomId, userId, serverId, rule, next);
}
/////
remote.homeToJoinRoom = function(roomId, userId, serverId, next){
    g_ddzGameMgr.joinRoom(roomId, 2, userId, serverId, next);
}

remote.homeToMatchRoom = function(userId, msg, serverId, next){
    g_ddzGameMgr.matchRoom(userId, msg, serverId, next);
}

/////
remote.homeToListPublicRoom = function(next){
    g_ddzGameMgr.listPublicRoom(next);
}
////
remote.timerToPayGameCoin = function(roomId, orderData, next){
    g_ddzGameMgr.payGameCoin(roomId, orderData, next);
}

remote.homeToRechargeCoin = function(roomId, userId, next){
    g_ddzGameMgr.rechargeCoin(roomId, userId, next);
}

remote.timerToCreateRoom = function(roomId, baseCoin, next){
    var rule = playConfig.gamePlayToRule[2];
    rule.baseCoin = baseCoin;
    g_ddzGameMgr.createSystemRoom(roomId, rule, next);
}