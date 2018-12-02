"use strict";
const TAG = "redisCoinZJH.js";
const constant = require("../shared/constant");

var pomelo = require("pomelo");
var client = pomelo.app.get("redis");

var exp = module.exports;

exp.setZJHRoom = function(roomId, data){
    client.hset("ZJH_ROOM", roomId, JSON.stringify(data));
}

exp.getZJHRoom = function(roomId, next){
    client.hget("ZJH_ROOM", roomId, function(err, data){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(data));
    });
}

exp.isExistRoom = function(roomId, next){
    client.hexists("ZJH_ROOM", roomId, next);
}

exp.rmvOneZJHRoom = function(roomId){
    client.hdel("ZJH_ROOM", roomId);
};

exp.getAllRoom = function(next){
    client.hgetall("ZJH_ROOM", function(err, data){
        if (err){
            return next(err, null);
        }
        next(null, data);
    });
}

/////////////////////战绩///////////////////////

exp.setZJHCombatGain = function(userId, data){
    client.hset("ZJH_COMBAT_GAIN", userId, JSON.stringify(data));
}

exp.getZJHCombatGain = function(userId, next){
    client.hget("ZJH_COMBAT_GAIN", userId, function(err, str){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(str));
    });
}

exp.setViewIdCombatId = function(viewId, combatId){
    client.hset("ZJH_VIEWID_COMBATID", viewId, combatId);
}

exp.getViewIdCombatId = function(viewId, next){
    client.hget("ZJH_VIEWID_COMBATID", viewId, next);
}

exp.isExistViewId = function(viewId, next){
    client.hexists("ZJH_VIEWID_COMBATID", viewId, next);
}