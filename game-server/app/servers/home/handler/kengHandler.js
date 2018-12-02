"use strict";
const TAG = "kengHandler.js";
const async = require("async");
const redis = require("../../../redis/redisDb");
const util = require("../../../util/utils");
const errcode = require("../../../shared/errcode");
const constant = require("../../../shared/constant");
const homeRPC = require("../../../rpc/homeRPC");

module.exports = function(app){
    return new KengHandler(app);
}

var KengHandler = function(app){
    this.app = app;
}

var handle = KengHandler.prototype;

handle.applyRoomList = function(msg, session, next){
    var self = this;
    var servers = self.app.getServersByType("game_keng");
    var parallelFunc = [];
    for (let i = 0, len = servers.length; i < len; ++i){
        var func = (cb)=>{
            homeRPC.rpcGameListPublicRoom(constant.GAME_PLAY.tian_da_keng, i+1, cb);
        }
        parallelFunc.push(func);
    }
    async.parallel(parallelFunc, (err, retArr)=>{
        if (err){
            return next(null, {code: errcode.FAIL});
        }
        var roomList = [];
        for (var i = 0, len = retArr.length; i < len; ++i){
            var ret = retArr[i];
            if (i == 0){
                roomList = ret.roomList;
            }else{
                roomList = roomList.concat(ret.roomList);
            }
        }
        next(null, {code: errcode.OK, roomList: roomList});
    });
}

handle.match = function(msg, session, next){
    var self = this;
    var userId = session.uid;
    var serverId = session.get("serverId");
    console.log(TAG, "@@@ match  ", session.get("roomId"));
    if (session.get("roomId")){
        return next(null, {code: errcode.NOT_IN_KENG_ROOM});
    }
    util.genRoomUniqueId(redis.existRoomId, function(err, roomId){
        if (err) {
            return next(null, {code: errcode.ROOMID_ERR});
        }
        msg.roomId = roomId;
        var gamePlay = constant.GAME_PLAY.tian_da_keng;
        msg.gamePlay = gamePlay;
        homeRPC.rpcGameMatchRoom(gamePlay, roomId, userId, msg, serverId, function(error, data){
            if (error){
                return next(error, data);
            }
            if (data.code == errcode.OK){
                session.set("roomId", data.roomId);
                session.set("gamePlay", gamePlay);
                session.pushAll(function(){
                    next(error, data);
                });
            }else{
                next(error, data);
            }
        });
    });
}

handle.createRoom = function(msg, session, next){
    var self = this;
    var userId = session.uid;
    var rule = msg.rule;
    var serverId = session.get("serverId");
    console.log(TAG, "@@@ createRoom  ", session.get("roomId"));
    if (session.get("roomId")){
        return next(null, {code: errcode.NOT_IN_KENG_ROOM});
    }
    util.genRoomUniqueId(redis.existRoomId, function(err, roomId){
        if (err) {
            return next(null, {code: errcode.ROOMID_ERR});
        }
        var gamePlay = constant.GAME_PLAY.tian_da_keng;
        rule.gamePlay = gamePlay;
        homeRPC.rpcGameCreateRoom(gamePlay, roomId, userId, serverId, rule, function(err, data){
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

handle.joinRoom = function(msg, session, next){
    var self = this;
    var roomId = msg.roomId;
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    var serverId = session.get("serverId");
    console.log(TAG, "-----joinRoom  ", session.get("roomId"));
    if (session.get("roomId")){
        return next(null, {code: errcode.HAVE_IN_KENG_ROOM});
    }
    var gamePlay = constant.GAME_PLAY.tian_da_keng;
    homeRPC.rpcGameJoinRoom(gamePlay, roomId, userId, serverId, function(err, data){
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
}