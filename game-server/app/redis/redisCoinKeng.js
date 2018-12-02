"use strict";
const TAG = "redisCoinKeng.js";
const constant = require("../shared/constant");

var pomelo = require("pomelo");
var client = pomelo.app.get("redis");

var exp = module.exports;

exp.setKengRoom = function(roomId, data){
    client.hset("KENG_ROOM", roomId, JSON.stringify(data));
}

exp.getKengRoom = function(roomId, next){
    client.hget("KENG_ROOM", roomId, function(err, data){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(data));
    });
}

exp.isExistRoom = function(roomId, next){
    client.hexists("KENG_ROOM", roomId, next);
}

exp.rmvOneKengRoom = function(roomId){
    client.hdel("KENG_ROOM", roomId);
};

exp.getAllRoom = function(next){
	client.hgetall("KENG_ROOM", function(err, data){
		if (err){
			return next(err, null);
		}
        next(null, data);
	});
}

/////////////////////战绩///////////////////////

exp.setKengCombatGain = function(userId, data){
    client.hset("KENG_COMBAT_GAIN", userId, JSON.stringify(data));
}

exp.getKengCombatGain = function(userId, next){
    client.hget("KENG_COMBAT_GAIN", userId, function(err, str){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(str));
    });
}

exp.setViewIdCombatId = function(viewId, combatId){
    client.hset("KENG_VIEWID_COMBATID", viewId, combatId);
}

exp.getViewIdCombatId = function(viewId, next){
    client.hget("KENG_VIEWID_COMBATID", viewId, next);
}

exp.isExistViewId = function(viewId, next){
    client.hexists("KENG_VIEWID_COMBATID", viewId, next);
}