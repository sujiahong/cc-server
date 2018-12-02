"use strict";
const TAG = "redisCoinNiu.js";
const constant = require("../shared/constant");

var pomelo = require("pomelo");
var client = pomelo.app.get("redis");

var exp = module.exports;

exp.setNiuRoom = function(roomId, data){
    client.hset("NIU_ROOM", roomId, JSON.stringify(data));
}

exp.getNiuRoom = function(roomId, next){
    client.hget("NIU_ROOM", roomId, function(err, data){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(data));
    });
}

exp.isExistRoom = function(roomId, next){
    client.hexists("NIU_ROOM", roomId, next);
}

exp.rmvOneNiuRoom = function(roomId){
    client.hdel("NIU_ROOM", roomId);
};

exp.getAllRoom = function(next){
	client.hgetall("NIU_ROOM", function(err, data){
		if (err){
			return next(err, null);
		}
        next(null, data);
	});
}

/////////////////////战绩///////////////////////

exp.setNiuCombatGain = function(userId, data){
    client.hset("NIU_COMBAT_GAIN", userId, JSON.stringify(data));
}

exp.getNiuCombatGain = function(userId, next){
    client.hget("NIU_COMBAT_GAIN", userId, function(err, str){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(str));
    });
}

exp.setViewIdCombatId = function(viewId, combatId){
    client.hset("NIU_VIEWID_COMBATID", viewId, combatId);
}

exp.getViewIdCombatId = function(viewId, next){
    client.hget("NIU_VIEWID_COMBATID", viewId, next);
}

exp.isExistViewId = function(viewId, next){
    client.hexists("NIU_VIEWID_COMBATID", viewId, next);
}