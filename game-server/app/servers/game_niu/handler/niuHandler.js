"use_strict";
const TAG = "niuHandler.js";
const niuGameMgr = require("../../../game_logic/coin_douniu/gameNiuMgr");
const errcode = require("../../../shared/errcode");
const constant = require("../../../shared/constant");
if (!global.g_niuGameMgr){
    global.g_niuGameMgr = new niuGameMgr();
}
module.exports = function(app){
    return new NiuHandler(app);
}

var NiuHandler = function(app){
    this.app = app;
}

var handle = NiuHandler.prototype;

handle.robBanker = function(msg, session, next){
    var roomId = session.get("roomId");
    var userId = session.uid;
	if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
	}
    g_niuGameMgr.robBanker(roomId, userId, msg.multi, next);
}

handle.robMultiple = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
	}
    g_niuGameMgr.robMultiple(roomId, userId, msg.multi, next);
}

handle.ready = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_NIU_ROOM})
    }
    g_niuGameMgr.ready(roomId, userId, next);
}

handle.flop = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
	}
    g_niuGameMgr.flop(roomId, userId, next);
}

handle.seatdown = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_NIU_ROOM})
    }
    g_niuGameMgr.seatdown(roomId, userId, msg.seatIdx, next);
}

handle.transpose = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
	}
    g_niuGameMgr.transpose(roomId, userId, next);
}

handle.exitRoom = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_NIU_ROOM})
    }
    g_niuGameMgr.exitRoom(roomId, userId, function(err, data){
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
        return next(null, {code: errcode.NOT_IN_NIU_ROOM})
    }
    var serverId = session.get("serverId");
    g_niuGameMgr.reconnect(roomId, userId, serverId, function(err, data){
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
        return next(null, {code: errcode.NOT_IN_NIU_ROOM})
    }
    var serverId = session.get("serverId");
    g_niuGameMgr.chat(roomId, userId, msg, next);
}

handle.modifyHandCard = function(msg, session, next){
    var userId = msg.userId;
    var cards = msg.cards;
    console.log(TAG, "modifyHandCard  ", msg);
    var roomId = session.get("roomId");
    g_niuGameMgr.modifyCard(roomId, userId, cards, next);
}