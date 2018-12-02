"use strict";
const TAG = "gobangHandler.js";
const errcode = require("../../../shared/errcode");
const userRecord = require("../../../parse/UserRecord");
const redis = require("../../../redis/redisDb");
const gobangRedis = require("../../../redis/redisGobang");
const constant = require("../../../shared/constant");
const util = require("../../../util/utils");
const gobangPusher = require("../../../pusher/gobang_push/push");
const gobangMgr = require("../../../game_logic/gobang/gameGobangMgr");

module.exports = function(app){
    if (!global.g_gobangGameMgr){
        global.g_gobangGameMgr = new gobangMgr();
    }
    return new Gobang(app);
}

var Gobang = function(app){
    this.app = app;
}

var handle = Gobang.prototype;

handle.playGobang = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    g_gobangGameMgr.play(roomId, userId, msg, next);
}

handle.exitGobang = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    var serverId = session.get("serverId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    g_gobangGameMgr.exit(roomId, userId, serverId, function(err, data){
        if (err){
            session.set("roomId", "");
            session.set("gamePlay", constant.GAME_PLAY.none);
            session.pushAll();
            return next(err, data);
        }
        next(err, data);
    });
}

handle.reconnectGobang = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    var serverId = session.get("serverId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    g_gobangGameMgr.reconnect(roomId, userId, serverId, function(err, data){
        if (err){
            session.set("roomId", "");
            session.set("gamePlay", constant.GAME_PLAY.none);
            session.pushAll();
            return next(err, data);
        }
        if (data.code != errcode.OK){
            session.set("roomId", "");
            session.set("gamePlay", constant.GAME_PLAY.none);
            session.pushAll();
        }
        next(err, data);
    });
}