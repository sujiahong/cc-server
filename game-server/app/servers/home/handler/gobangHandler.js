"use strict";
const TAG = "gobangHandler.js";
const errcode = require("../../../shared/errcode");
const redis = require("../../../redis/redisDb");
const constant = require("../../../shared/constant");
const util = require("../../../util/utils");
const homeRPC = require("../../../rpc/homeRPC");

module.exports = function(app){
    return new Gobang(app);
}

var Gobang = function(app){
    this.app = app;
}

var handle = Gobang.prototype;

handle.createGobang = function(msg, session, next){
    var self = this;
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    var serverId = session.get("serverId");
    console.log(TAG, "@@@ createGobang  ", session.get("roomId"));
    if (session.get("roomId")){
        return next(null, {code: errcode.HAVE_IN_NIU_ROOM});
    }
    util.genRoomUniqueId(redis.existRoomId, function(err, roomId){
        if (err) {
            return next(null, {code: errcode.ROOMID_ERR});
        }
        var gamePlay = constant.GAME_PLAY.gobang;
        homeRPC.rpcGameCreateRoom(gamePlay, roomId, userId, serverId, null, function(err, data){
            if (err){
                return next(err, data);
            }
            if (data.code == errcode.OK){
                session.set("roomId", roomId);
                session.set("gamePlay", gamePlay);
                session.pushAll(function(){
                    next(err, data);
                });
            }else{
                next(err, data);
            }
        });
    });
}