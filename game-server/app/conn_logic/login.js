"use_strict";
const TAG = "login.js";
const errcode = require('../shared/errcode');
const constant = require("../shared/constant");  
const redis = require('../redis/redisDb');
const userRecord = require("../parse/UserRecord");
const activeUser = require("../parse/ActiveUserRecord");
const connectorRPC = require("../rpc/connectorRPC");
const register = require("./register");

var exp = module.exports;

exp.login = function (param, next) {
    var wxId = getWXId(param);
    redis.getRegisterUId(wxId, function (err, userId) {
        if (err){
            console.error(TAG, "login error:: ", err);
            return next(errcode.REDIS_DATABASE_ERR, err);
        }
        if (userId){
            console.log(TAG, "go 登录！！");
            userRecord.getRecord(userId, function(err, record){
                if (err){
                    console.error(TAG, "updateUserByObject error:: ", err);
                    return next(errcode.MONGO_DATABASE_ERR, err);
                }
                if (record.get("freeze")){
                    return next(errcode.HAVE_FROZEN);
                }
                userRecord.updateUserByObjectId(userId, param, function(err){});
                var userNo = record.get("userNo");
                activeUser.addRecord({userId: userId, userNo: userNo, registerTime: record.createdAt});//日活
                var res = {
                    code: errcode.OK,
                    userId: userId,
                    userNo: userNo,
                    roomCard: record.get("restCard"),
                    coinNum: record.get("coinNum"),
                    nickName: param.nickName,
                    roomId: record.get("roomId"),
                    gamePlay: record.get("gamePlay"),
                    comment: record.get("comment") || "",
                    sex: param.sex,
                    loginIp: param.loginIp,
                    proxyId: record.get("bindId") || "",
                };
                next(null, res);
            });
        }else{
            console.log(TAG, "go 注册！！");
            register.registerLogin(wxId, param, next);
        }
    });
}

var getWXId = function(param){
    if (param.wxUnionId){
        return param.wxUnionId;
    }else{
        return param.wxOpenId;
    }
}

exp.isRegisted = function(param, next){
    var wxId = getWXId(param);
    redis.isHaveRegisted(wxId, function(err, is){
        if (err){
            return next(err);
        }
        if (is == 1){
            return next(null, true);
        }else{
            return next(null, false);
        }
    });
}

exp.notifyOnline = function(self, ret, serverId){
	console.log(TAG, "通知游戏服务器上线!!!  roomId: ", ret.roomId, ret.gamePlay);
	var userId = ret.userId;
	var roomId = ret.roomId;
	var gamePlay = ret.gamePlay;
	if (roomId && gamePlay){
        connectorRPC.rpcGameOnline(gamePlay, roomId, userId, serverId, function(error){
            console.log(TAG, gamePlay, "onnectorToOnline error", error);
            if (error){
                var gameServers = self.app.getServersByType(constant.GAME_PLAY_SERVER_TYPE[gamePlay]);
                if (!gameServers || gameServers.length === 0) {
                    userRecord.updateUserByUserId(userId, {roomId: "", gamePlay: 0});
                }
                self.sessionService.kick(userId, function(){});
            }
        });
	}
}