"use_strict";
const TAG = "jinRemote.js";
const jinGameMgr = require("../../../game_logic/coin_jinhua/gameJinHuaMgr");
const playConfig = require("../../../shared/playConfig");

if (!global.g_ZJHGameMgr){
    global.g_ZJHGameMgr = new jinGameMgr();
}

module.exports = function(app){
    return new JinRemote(app);
}

var JinRemote = function(app){
    this.app = app;
}

var remote = JinRemote.prototype;

remote.connectorToOffline = function(roomId, userId, next){
    g_ZJHGameMgr.playerOffline(roomId, userId, next);
}

remote.connectorToOnline = function(roomId, userId, serverId, next){
    g_ZJHGameMgr.playerOnline(roomId, userId, serverId, next);
}

remote.homeToCreateRoom = function(roomId, userId, serverId, rule, next){
    g_ZJHGameMgr.createRoom(roomId, userId, serverId, rule, next);
}
/////
remote.homeToJoinRoom = function(roomId, userId, serverId, next){
    g_ZJHGameMgr.joinRoom(roomId, 3, userId, serverId, next);
}

remote.homeToMatchRoom = function(userId, msg, serverId, next){
    g_ZJHGameMgr.matchRoom(userId, msg, serverId, next);
}

/////
remote.homeToListPublicRoom = function(next){
    g_ZJHGameMgr.listPublicRoom(next);
}

remote.timerToPayGameCoin = function(roomId, orderData, next){
    g_ZJHGameMgr.payGameCoin(roomId, orderData, next);
}

remote.homeToRechargeCoin = function(roomId, userId, next){
    g_ZJHGameMgr.rechargeCoin(roomId, userId, next);
}

remote.timerToCreateRoom = function(roomId, baseCoin, next){
    var rule = playConfig.gamePlayToRule[3];
    rule.baseCoin = baseCoin;
    g_ZJHGameMgr.createSystemRoom(roomId, rule, next);
}