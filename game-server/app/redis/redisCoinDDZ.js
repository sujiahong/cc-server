const TAG = "redisCoinDDZ.js";
var pomelo = require("pomelo");
var client = pomelo.app.get("redis");

var exp = module.exports;

exp.setDDZRoom = function(roomId, data){
    client.hset("DDZ_ROOM", roomId, JSON.stringify(data));
}

exp.getDDZRoom = function(roomId, next){
    client.hget("DDZ_ROOM", roomId, function(err, data){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(data));
    });
}

exp.isExistRoom = function(roomId, next){
    client.hexists("DDZ_ROOM", roomId, next);
}

exp.rmvOneDDZRoom = function(roomId){
    client.hdel("DDZ_ROOM", roomId);
};

exp.getAllRoom = function(next){
    client.hgetall("DDZ_ROOM", function(err, data){
        if (err){
            return next(err, null);
        }
        next(null, data);
    });
}

/////////////////////战绩///////////////////////

exp.setDDZCombatGain = function(userId, data){
    client.hset("DDZ_COMBAT_GAIN", userId, JSON.stringify(data));
}

exp.getDDZCombatGain = function(userId, next){
    client.hget("DDZ_COMBAT_GAIN", userId, function(err, str){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(str));
    });
}

exp.setViewIdCombatId = function(viewId, combatId){
    client.hset("DDZ_VIEWID_COMBATID", viewId, combatId);
}

exp.getViewIdCombatId = function(viewId, next){
    client.hget("DDZ_VIEWID_COMBATID", viewId, next);
}

exp.isExistViewId = function(viewId, next){
    client.hexists("DDZ_VIEWID_COMBATID", viewId, next);
}