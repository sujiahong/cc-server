"use_strict";
const TAG = "ZJHHandler.js";
const jinGameMgr = require("../../../game_logic/coin_jinhua/gameJinHuaMgr");
const errcode = require("../../../shared/errcode");
const constant = require("../../../shared/constant");
if (!global.g_ZJHGameMgr){
    global.g_ZJHGameMgr = new jinGameMgr();
}
module.exports = function(app){
    return new JinHandler(app);
}

var JinHandler = function(app){
    this.app = app;
}

var handle = JinHandler.prototype;

handle.betCoin = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    g_ZJHGameMgr.betCoin(roomId, userId, msg, next);
}

handle.seeCard = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    g_ZJHGameMgr.seeCard(roomId, userId, next);
}

handle.discard = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    g_ZJHGameMgr.discard(roomId, userId, next);
}

handle.compareCard = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    g_ZJHGameMgr.compareCard(roomId, userId, msg, next);
}

handle.ready = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_ZJH_ROOM})
    }
    g_ZJHGameMgr.ready(roomId, userId, next);
}

handle.seatdown = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
        return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_ZJH_ROOM})
    }
    g_ZJHGameMgr.seatdown(roomId, userId, msg.seatIdx, next);
}

handle.transpose = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
        return next(null, {code: errcode.LOGINED_INVALID});
    }
    g_ZJHGameMgr.transpose(roomId, userId, next);
}

handle.exitRoom = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_ZJH_ROOM})
    }
    g_ZJHGameMgr.exitRoom(roomId, userId, function(err, data){
        if (err){
            session.set("roomId", "");
            session.set("gamePlay", constant.GAME_PLAY.none);
            session.pushAll();
            return next(err, data);
        }
        next(err, data);
    });
}

handle.reconnect = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_ZJH_ROOM})
    }
    var serverId = session.get("serverId");
    g_ZJHGameMgr.reconnect(roomId, userId, serverId, function(err, data){
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

handle.chat = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_ZJH_ROOM})
    }
    var serverId = session.get("serverId");
    g_ZJHGameMgr.chat(roomId, userId, msg, next);
}

handle.modifyHandCard = function(msg, session, next){
    var userId = msg.userId;
    var cards = msg.cards;
    console.log(TAG, "modifyHandCard  ", msg);
    var roomId = session.get("roomId");
    g_ZJHGameMgr.modifyCard(roomId, userId, cards, next);
}