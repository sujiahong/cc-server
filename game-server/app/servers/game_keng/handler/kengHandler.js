"use_strict";
const TAG = "kengHandler.js";
const kengGameMgr = require("../../../game_logic/coin_keng/gameKengMgr");
const errcode = require("../../../shared/errcode");
const constant = require("../../../shared/constant");
if (!global.g_kengGameMgr){
    global.g_kengGameMgr = new kengGameMgr();
}
module.exports = function(app){
    return new KengHandler(app);
}

var KengHandler = function(app){
    this.app = app;
}

var handle = KengHandler.prototype;

handle.betCoin = function(msg, session, next){
    var roomId = session.get("roomId");
    var userId = session.uid;
	if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
	}
    g_kengGameMgr.betCoin(roomId, userId, msg, next);
}

handle.discard = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
	}
    g_kengGameMgr.discard(roomId, userId, next);
}

handle.ready = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_KENG_ROOM})
    }
    g_kengGameMgr.ready(roomId, userId, next);
}

handle.seatdown = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_KENG_ROOM})
    }
    g_kengGameMgr.seatdown(roomId, userId, msg.seatIdx, next);
}

handle.transpose = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
	}
    g_kengGameMgr.transpose(roomId, userId, next);
}

handle.exitRoom = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_KENG_ROOM})
    }
    g_kengGameMgr.exitRoom(roomId, userId, function(err, data){
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
        return next(null, {code: errcode.NOT_IN_KENG_ROOM})
    }
    var serverId = session.get("serverId");
    g_kengGameMgr.reconnect(roomId, userId, serverId, function(err, data){
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
        return next(null, {code: errcode.NOT_IN_KENG_ROOM})
    }
    var serverId = session.get("serverId");
    g_kengGameMgr.chat(roomId, userId, msg, next);
}

handle.modifyHandCard = function(msg, session, next){
    var userId = msg.userId;
    var cards = msg.cards;
    console.log(TAG, "modifyHandCard  ", msg);
    var roomId = session.get("roomId");
    g_kengGameMgr.modifyCard(roomId, userId, cards, next);
}