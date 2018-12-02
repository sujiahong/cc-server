"use_strict";
const TAG = "gobangRemote.js";
const gobangMgr = require("../../../game_logic/gobang/gameGobangMgr");


module.exports = function(app){
    if (!global.g_gobangGameMgr){
        global.g_gobangGameMgr = new gobangMgr();
    }
    return new GobangRemote(app);
}

var GobangRemote = function(app){
    this.app = app;
}

var remote = GobangRemote.prototype;

remote.connectorToOffline = function(roomId, userId, next){
    g_gobangGameMgr.playerOffline(roomId, userId, next);
}

remote.connectorToOnline = function(roomId, userId, serverId, next){
    g_gobangGameMgr.playerOnline(roomId, userId, serverId, next);
}

remote.homeToCreateRoom = function(roomId, userId, serverId, rule, next){
    g_gobangGameMgr.createGobangRoom(roomId, userId, serverId, next);
}
/////
remote.homeToJoinRoom = function(roomId, userId, serverId, next){
    g_gobangGameMgr.joinGobangRoom(roomId, userId, serverId, next);
}