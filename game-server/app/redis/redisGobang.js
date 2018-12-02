"use strict"

var pomelo = require('pomelo');
var redis = pomelo.app.get("redis");

var exp = module.exports;

exp.setGobangData = function(id, data){
    redis.set("GOBANG_" + id, JSON.stringify(data));
}

exp.getGobangData = function(id, next){
    redis.get("GOBANG_" + id, function(err, str){
        if (str){
            return next(err, JSON.parse(str));
        }
        next(err, str);
    });
}

exp.delGobangData = function(id){
    redis.del("GOBANG_" + id);
}

/////////////////////战绩///////////////////////

exp.setGobangCombatGain = function(userId, data){
    redis.hset("GOBANG_COMBAT_GAIN", userId, JSON.stringify(data));
}

exp.getGobangCombatGain = function(userId, next){
    redis.hget("GOBANG_COMBAT_GAIN", userId, function(err, str){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(str));
    });
}

exp.setViewIdCombatId = function(viewId, combatId){
    redis.hset("BOBANG_VIEWID_COMBATID", viewId, combatId);
}

exp.getViewIdCombatId = function(viewId, next){
    redis.hget("BOBANG_VIEWID_COMBATID", viewId, next);
}

exp.isExistViewId = function(viewId, next){
    redis.hexists("BOBANG_VIEWID_COMBATID", viewId, next);
}