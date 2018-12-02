"use strict";
const TAG = "redisCoinTexas.js";
const constant = require("../shared/constant");

var pomelo = require("pomelo");
var client = pomelo.app.get("redis");

var exp = module.exports;

exp.setTexasRoom = function(roomId, data){
    client.hset("TEXAS_ROOM", roomId, JSON.stringify(data));
}

exp.getTexasRoom = function(roomId, next){
    client.hget("TEXAS_ROOM", roomId, function(err, data){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(data));
    });
}

exp.isExistRoom = function(roomId, next){
    client.hexists("TEXAS_ROOM", roomId, next);
}

exp.rmvOneTexasRoom = function(roomId){
    client.hdel("TEXAS_ROOM", roomId);
};

exp.getAllRoom = function(next){
	client.hgetall("TEXAS_ROOM", function(err, data){
		if (err){
			return next(err, null);
		}
        next(null, data);
	});
}

/////////////////////战绩///////////////////////

exp.setTexasCombatGain = function(userId, data){
    client.hset("TEXAS_COMBAT_GAIN", userId, JSON.stringify(data));
}

exp.getTexasCombatGain = function(userId, next){
    client.hget("TEXAS_COMBAT_GAIN", userId, function(err, str){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(str));
    });
}

exp.setViewIdCombatId = function(viewId, combatId){
    client.hset("TEXAS_VIEWID_COMBATID", viewId, combatId);
}

exp.getViewIdCombatId = function(viewId, next){
    client.hget("TEXAS_VIEWID_COMBATID", viewId, next);
}

exp.isExistViewId = function(viewId, next){
    client.hexists("TEXAS_VIEWID_COMBATID", viewId, next);
}