const TAG = "ddzHandler.js";
const ddzGameMgr = require("../../../game_logic/coin_ddz/gameCoinMgr");
const errcode = require("../../../shared/errcode");
const constant = require("../../../shared/constant");
if (!global.g_ddzGameMgr){
    global.g_ddzGameMgr = new ddzGameMgr();
}

module.exports = function(app){
    return new Handler(app);
}

var Handler = function(app){
	this.app = app;
}

var handle = Handler.prototype;

handle.robLandlord = function(msg, session, next){
	var self = this;
	var userId = session.uid;
	var roomId = session.get("roomId");
	if (!userId || !roomId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
	g_ddzGameMgr.robLandlord(roomId, userId, msg.robScore, next);
};

handle.playCard = function(msg, session, next){
	var self = this;
	var userId = session.uid;
	var roomId = session.get("roomId");
	if (!userId || !roomId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
	if (!msg.cards) {
		return next(null, {code: Code.PLAY_CARD_ERR});
	}
	g_ddzGameMgr.playCard(roomId, userId, msg.cards, next);
};

handle.abrogateTrustee = function(msg, session, next){
    var self = this;
	var userId = session.uid;
	var roomId = session.get("roomId");
	if (!userId || !roomId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
	g_ddzGameMgr.abrogateTrustee(roomId, userId, next);
}

handle.ready = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_DDZ_ROOM})
    }
    g_ddzGameMgr.ready(roomId, userId, next);
}

handle.seatdown = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_DDZ_ROOM})
    }
    g_ddzGameMgr.seatdown(roomId, userId, msg.seatIdx, next);
}

handle.transpose = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!roomId || !userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
	}
    g_ddzGameMgr.transpose(roomId, userId, next);
}

handle.exitRoom = function(msg, session, next){
    var userId = session.uid;
    var roomId = session.get("roomId");
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    if (!roomId){
        return next(null, {code: errcode.NOT_IN_DDZ_ROOM})
    }
    g_ddzGameMgr.exitRoom(roomId, userId, function(err, data){
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
        return next(null, {code: errcode.NOT_IN_DDZ_ROOM})
    }
    var serverId = session.get("serverId");
    g_ddzGameMgr.reconnect(roomId, userId, serverId, function(err, data){
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
        return next(null, {code: errcode.NOT_IN_DDZ_ROOM})
    }
    var serverId = session.get("serverId");
    g_ddzGameMgr.chat(roomId, userId, msg, next);
}