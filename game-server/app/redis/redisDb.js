"use strict";
const TAG = "redisDb.js";
var pomelo = require('pomelo');
var redis = pomelo.app.get("redis");

var exp = module.exports;

///////////////注册用户表/////////////////
exp.addToRegisterTable = function(wxId, userId){
    var _set = function(){
        redis.hset("REGISTER_USER", wxId, userId, function(err, reply){
            if (err || reply != 1){
                return _set();
            }
        });
    }
    _set();
}

exp.getRegisterUId = function(wxId, next){
    redis.hget("REGISTER_USER", wxId, next);
}

exp.isHaveRegisted = function(wxId, next){
    redis.hexists("REGISTER_USER", wxId, next);
}

////////////////////用户id表/////////////////////
exp.setHUserId = function(userNo, userId){
    var _set = function(){
        redis.hset("USERNO_USERID", userNo, userId, function(err, reply){
            if (err || reply != 1){
                return _set();
            }
        });
    }
    _set();
}
exp.getHUserIdByUserNo = function(userNo, next){
    redis.hget("USERNO_USERID", userNo, next);
}

exp.isHaveUserNo = function(userNo, next){
    redis.hexists("USERNO_USERID", userNo, next);
}

//////////////////用户id-serverid表////////////////
exp.setUserIdServerId = function(userId, serverId){
	var _set = function(){
        redis.hset("USERID_SERVERID", userId, serverId, function(err, reply){
            if (err || reply != 1){
                return _set();
            }
        });
    }
    _set();
};

exp.rmvUserIdServerId = function(userId){
	redis.hdel("USERID_SERVERID", userId);
};

exp.getUserIdServerId = function(userId, next){
	redis.hget("USERID_SERVERID", userId, next);
}

exp.delUserIdServerIdKey = function(){
	redis.del("USERID_SERVERID");
};

exp.getAllUserIdServerId = function(next){
	redis.hgetall("USERID_SERVERID", next);
};

exp.getMServerIdByUidArr = function(uidArr, next){
	redis.hmget("USERID_SERVERID", uidArr, next);
}

exp.existServerId = function(uid, next){
	redis.hexists("USERID_SERVERID", uid, next);
}

exp.getCurrentUserAmount = function(next){
    redis.hlen("USERID_SERVERID", next);
}

///////////////////排行榜/////////////////////
exp.setCoinRankingList = function(str){
	redis.set("COIN_RANKING_LIST", str);
}

exp.getCoinRankingList = function(next){
	redis.get("COIN_RANKING_LIST", next);
}

///////////////////房间免费//////////////////////
exp.getRoomFree = function(next){
	redis.get("roomFree", function(err, boolVal){
		if (err){
			return next(err, null);
		}
		return next(null, boolVal);
	});
}

//////////////////游戏公告////////////////////
exp.setGameNotice = function(note){
	redis.set("GAME_NOTICE", note);
}

exp.getGameNotice = function(next){
	redis.get("GAME_NOTICE", next);
}

////////////////用户日活//////////////////
exp.setActiveUser = function(userId, userNo){
    var dt = new Date();
    var year = dt.getFullYear();
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    redis.hset("ACTIVE_USER_" + year + "-" + month + "-" + day, userId, userNo);
    exp.setExpire(year, month, day);
}

exp.existsActiveUser = function(userId, next){
    var dt = new Date();
    var year = dt.getFullYear();
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    redis.hexists("ACTIVE_USER_" + year + "-" + month + "-" + day, userId, next);
}

exp.delActiveUser = function(){
    redis.del("ACTIVE_USER_" + year + "-" + month + "-" + day);
}

exp.setExpire = function(year, month, day){
    redis.ttl("ACTIVE_USER_" + year + "-" + month + "-" + day, function(err, time){
        if (err){
            return console.log( "取日活剩余时间错误", err);
        }
        if (time == -1){
            redis.expire("ACTIVE_USER_" + year + "-" + month + "-" + day, 28*3600);
        }
    });
}

///////////////////房间id玩法///////////////////////
exp.setRoomIdToPlay = function(roomId, play){
    var _set = function(){
        redis.hset("ROOMID_ROOMPLAY", roomId, play, (err, reply)=>{
            if (err || reply != 1){
                return _set();
            }
        });
    }
    _set();
}

exp.getRoomIdToPlay = function(roomId, next){
	redis.hget("ROOMID_ROOMPLAY", roomId, next);
}

exp.delRoomIdToPlay = function(roomId, next){
    var count = 0 ;
    var _del = function(){
        redis.hdel("ROOMID_ROOMPLAY", roomId, (err, reply)=>{
            console.log(TAG, "delRoomIdToPlay ", err, reply);
            if (err || reply != 1){
                count ++;
                if (count < 10)
                    return _del();
            }
            next ? next() : null;
        });
    }
    _del();
}

exp.existRoomId = function(roomId, next){
	redis.hexists("ROOMID_ROOMPLAY", roomId, next);
}

exp.clearRoomIdToPlay = function(){
	redis.del("ROOMID_ROOMPLAY");
}

////////////////////每日首次分享时间///////////////////////
exp.setUserIdToShareTime = function(userId, stamp){
	redis.hset("USERID_SHARETIME", userId, stamp);
}

exp.existUserShared = function(userId, next){
	redis.hexists("USERID_SHARETIME", userId, next);
}

exp.clearUserIdToShareTime = function(){
	redis.del("USERID_SHARETIME");
}

/////////////////////没支付订单信息////////////////////////
exp.setNoPayOrderData = function(orderId, data){
	var _set = function(){
        redis.hset("NO_PAY_ORDER", orderId, JSON.stringify(data), (err, reply)=>{
            if (err || reply != 1){
                return _set();
            }
        });
    }
    _set();
}

exp.getNoPayOrderData = function(orderId, next){
	redis.hget("NO_PAY_ORDER", orderId, next);
}

exp.getAndDelNoPayOrderData = function(orderId, next){
	redis.hget("NO_PAY_ORDER", orderId, next);
	exp.delNoPlayOrderData(orderId);
}

exp.delNoPlayOrderData = function(orderId){
    var count = 0 ;
	var _del = function(){
		redis.hdel("NO_PAY_ORDER", orderId, (err, reply)=>{
            console.log(TAG, "delNoPlayOrderData ", err, reply);
            if (err || reply != 1){
                count ++;
                if (count < 3)
                    return _del();
            }
		});
	}
	_del();
}