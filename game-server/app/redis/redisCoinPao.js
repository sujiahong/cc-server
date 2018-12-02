const TAG = "redisCoinPao.js";
var pomelo = require("pomelo");
var client = pomelo.app.get("redis");

var exp = module.exports;

exp.setPaoRoom = function(roomId, data){
    client.hset("PAO_ROOM", roomId, JSON.stringify(data));
}

exp.getPaoRoom = function(roomId, next){
    client.hget("PAO_ROOM", roomId, function(err, data){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(data));
    });
}

exp.isExistRoom = function(roomId, next){
    client.hexists("PAO_ROOM", roomId, next);
}

exp.rmvOnePaoRoom = function(roomId){
    client.hdel("PAO_ROOM", roomId);
};

exp.getAllRoom = function(next){
    client.hgetall("PAO_ROOM", function(err, data){
        if (err){
            return next(err, null);
        }
        next(null, data);
    });
}

/////////////////////战绩///////////////////////

exp.setPaoCombatGain = function(userId, data){
    client.hset("PAO_COMBAT_GAIN", userId, JSON.stringify(data));
}

exp.getPaoCombatGain = function(userId, next){
    client.hget("PAO_COMBAT_GAIN", userId, function(err, str){
        if (err){
            return next(err);
        }
        next(null, JSON.parse(str));
    });
}

exp.setViewIdCombatId = function(viewId, combatId){
    client.hset("PAO_VIEWID_COMBATID", viewId, combatId);
}

exp.getViewIdCombatId = function(viewId, next){
    client.hget("PAO_VIEWID_COMBATID", viewId, next);
}

exp.isExistViewId = function(viewId, next){
    client.hexists("PAO_VIEWID_COMBATID", viewId, next);
}