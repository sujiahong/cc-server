"use_strict";
const TAG = "ActiveUser.js";
const pomelo = require("pomelo");
var parse = pomelo.app.get("Parse");
var activeUser = parse.Object.extend("activeUserRecord");
var redis = require("../redis/redisDb");

var exp = module.exports;

exp.addRecord = function(parm, callback){
    redis.existsActiveUser(parm.userId, function(err, is){
        if (err){
            console.log(TAG, "reids 取数据失败！！！", parm.userId, parm.userNo);
            return callback(err);
        }
        if (is == 1){
            callback ? callback() : null;
        }else{
            redis.setActiveUser(parm.userId, parm.userNo);
            _insertRecord(parm, callback);
        }
    });
}

var _insertRecord = function(parm, callback){
    var active = new activeUser();
    active.set("userId", parm.userId);
    active.set("userNo", parm.userNo);
    active.set("registerTime", parm.registerTime);

    active.save(null, {
        success: function(ret){
            callback ? callback(null, ret) : null;
        },
        error: function(ret, error){
            callback ? callback(error, null) : null;
        }
    });
}