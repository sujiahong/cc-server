"use_strict";
const TAG = "register.js";
const redis = require("../redis/redisDb");
const userRecord = require("../parse/UserRecord");
const newRegister = require("../parse/NewRegisterRecord");
const activeUser = require("../parse/ActiveUserRecord");
const util = require("../util/utils");
const errcode = require("../shared/errcode");

var exp = module.exports;

exp.registerLogin = function(wxId, param, next){
    genUserUniqueId(function(err, userNo){
        if (err){
            console.error(TAG, "registerLogin error:: ", err);
            return next(errcode.REGISTER_FAIL);
        }
        param.userNo = userNo;
        userRecord.addRecord(param, function(err, record){
            if (err){
                console.error(TAG, "userRecord.addRecord error::  ", err);
                return next(errcode.MONGO_DATABASE_ERR, err);
            }
            param.userId = record.id.toString();
            newRegister.addRecord({userId: param.userId, userNo: param.userNo});        //新增
			activeUser.addRecord({userId: param.userId, userNo: param.userNo, registerTime: record.createdAt});//日活
            redis.setHUserId(userNo, param.userId);
            redis.addToRegisterTable(wxId, param.userId);
            var res = {
                code: errcode.OK,
                userId: param.userId,
                userNo: param.userNo,
                roomCard: record.get("restCard"),
                coinNum: record.get("coinNum"),
                nickName: param.nickName,
                roomId: "",
                gamePlay: record.get("gamePlay"),
                comment: record.get("comment") || "",
                sex: param.sex,
                loginIp: param.loginIp,
                proxyId: record.get("bindUserNo") || "",
            };
            next(null, res);
        });
    });
}

var genUserUniqueId = function(next){
    var cur = 0;
    var _genUniqueId = function(){
        var id = util.rand(6);
        redis.isHaveUserNo(id, function(err, is){
            if (err){
                return next(err);
            }
            if (is == 1){
                cur++;
                if (cur < 10){
                    _genUniqueId();
                }else{
                    return next("超出生成id次数");
                }
            }else{
                return next(null, id);
            }
        });
    }
    _genUniqueId();
}