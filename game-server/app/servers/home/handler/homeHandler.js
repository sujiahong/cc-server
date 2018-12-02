"use strict";
const TAG = "homeHandler.js";
const errcode = require("../../../shared/errcode");
const playConfig = require("../../../shared/playConfig");
const userRecord = require("../../../parse/UserRecord");
const tradingRecord = require("../../../parse/TransactionRecord");
const configRecord = require("../../../parse/Config");
const redis = require("../../../redis/redisDb");
const constant = require("../../../shared/constant");
const httpUtil = require("../../../util/httpUtil");
const util = require("../../../util/utils");
const homeRPC = require("../../../rpc/homeRPC");

module.exports = function(app){
    return new HomeHandler(app);
}

var HomeHandler = function(app){
    this.app = app;
}

var handle = HomeHandler.prototype;

handle.joinRoom = function(msg, session, next){
    var self = this;
    var roomId = msg.roomId;
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    var serverId = session.get("serverId");
    console.log(TAG, "@@@ joinRoom  ", session.get("roomId"));
    if (session.get("roomId")){
        return next(null, {code: errcode.HAVE_IN_ROOM});
    }
    redis.getRoomIdToPlay(roomId, function(err, gamePlay){
        if (err){
            return next(null, {code: errcode.REDIS_DATABASE_ERR});
        }
        if (!gamePlay){
            return next(null, {code: errcode.ROOM_NOT_EXIST});
        }
        homeRPC.rpcGameJoinRoom(gamePlay, roomId, userId, serverId, function(err, data){
            if (err){
                return next(err, data);
            }
            if (data.code == errcode.OK){
                session.set("roomId", roomId);
                session.set("gamePlay", gamePlay);
                session.pushAll(function(){
                    next(err, data);
                });
            }else{
                next(err, data);
            }
        });
    });
}

handle.refreshLocation = function(msg, session, next){
    var userId = session.uid;
    userRecord.updateUserByUserId(userId, {location: msg.location}, function(error){
        if (error){
            console.log(TAG, "====refreshLocation==  error: ", error);
            return next(null, {code: errcode.MONGO_DATABASE_ERR});
        }
        next(null, {code: errcode.OK});
    });
}

handle.lookCombatList = function(msg, session, next){
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    var gamePlay = msg.gamePlay;
    var funcArr = playConfig.gamePlayToSetGetCombatGainFunc[gamePlay];
    if (funcArr){
        funcArr[0](userId, function(err, combatArr){
            if (err){
                console.log(TAG, "====lookCombatGain==  error: ", err);
                return next(null, {code: errcode.REDIS_DATABASE_ERR});
            }
            if (!combatArr){
                combatArr = [];
            }
            expireCombatList(combatArr);
            funcArr[1](userId, combatArr);
            next(null, {code: errcode.OK, combatList: combatArr});
        });
    }else{
        next(null, {code: errcode.FAIL});
    }
}

var expireCombatList = function(combatArr){
    var curStamp = Date.now();
    for (var len = combatArr.length, i = len - 1; i > -1; --i){
        if (curStamp - combatArr[i].storeStamp > 24 * 3600000){
            combatArr.pop();
        }else{
            if (i == len - 1){
                break;
            }
        }
    }
}

handle.lookCombatDetail = function(msg, session, next){
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    var gamePlay = msg.gamePlay;
    var redisMongoArr = playConfig.gamePlayToRedisMongoArr[gamePlay];
    if (!redisMongoArr){
        return next(null, {code: errcode.FAIL});
    }
    var redisClient = redisMongoArr[0];
    var combatRecord = redisMongoArr[1];
    var viewId = msg.viewId;
    redisClient.getViewIdCombatId(viewId, function(err, combatId){
        if (err){
            console.log(TAG, "====lookCombatDetail==  error: ", err);
            return next(null, {code: errcode.REDIS_DATABASE_ERR});
        }
        if (!combatId){
            return next(null, {code: errcode.COMBAT_NOT_EXIST});
        }
        combatRecord.getRecordById(combatId, function(err, record){
            if (err){
                console.log(TAG, "====lookCombatDetail==  error: ", err);
                return next(null, {code: errcode.MONGO_DATABASE_ERR});
            }
            var data = null;
            if (gamePlay == constant.GAME_PLAY.niu_niu){
                data = {
                    players: record.get("players"),
                    roomLaw: record.get("roomLaw"),
                    bankerId: record.get("bankerId"),
                };
            }else if (gamePlay == constant.GAME_PLAY.tian_da_keng){
                data = {
                    players: record.get("players"),
                    roomLaw: record.get("roomLaw"),
                    maxPersons: record.get("uplimitPersons"),
                    baseCoin: record.get("baseCoin"),
                    rulePlay: record.get("rulePlay"),
                    startTime: record.get("startStamp"),
                    endTime: record.get("endStamp"),
                    operationArray: record.get("operationArray"),
                };
            }else if(gamePlay == constant.GAME_PLAY.gobang){
                data = {};
            }else if (gamePlay == constant.GAME_PLAY.zha_jin_hua){
                data = {
                    players: record.get("players"),
                    roomLaw: record.get("roomLaw"),
                    maxPersons: record.get("uplimitPersons"),
                    baseCoin: record.get("baseCoin"),
                    rulePlay: record.get("rulePlay"),
                    startTime: record.get("startStamp"),
                    endTime: record.get("endStamp"),
                    operationArray: record.get("operationArray"),
                    roundCount: record.get("roundCount"),
                    dealerId: record.get("dealerId")
                };
            }else if (gamePlay == constant.GAME_PLAY.dou_di_zhu){
                data = {
                    players: record.get("players"),
                    roomLaw: record.get("roomLaw"),
                    maxPersons: record.get("uplimitPersons"),
                    baseCoin: record.get("baseCoin"),
                    rulePlay: record.get("rulePlay"),
                    startTime: record.get("startStamp"),
                    endTime: record.get("endStamp"),
                    operationArray: record.get("operationArray"),
                    bombNum: record.get("bombNum"),
                    multiple: record.get("multiple"),
                    dealerId: record.get("dealerId")
                };
            }
            next(null, {code: errcode.OK, combatData: data});
        });
    });
}

handle.lookRankingList = function(msg, session, next){
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    redis.getCoinRankingList(function(err, str){
        if (err){
            return next(null, {code: REDIS_DATABASE_ERR});
        }
        if (str){
            next(null, {code: errcode.OK, rankingList: str});
        }else{
            userRecord.generateCoinRankingList(function(err, retArr){
                if (err){
                    return next(null, {code: MONGO_DATABASE_ERR});
                }
                var arr = [];
                for (var i = 0, len = retArr.length; i < len; ++i){
                    var ret = retArr[i];
                    arr.push({
                        userId: ret.id.toString(),
                        nickname: ret.get("nickname"),
                        userNo: ret.get("userNo"),
                        comment: ret.get("comment"),
                        userIcon: ret.get("userIconUrl"),
                        coinNum: ret.get("coinNum")
                    })
                }
                var str = JSON.stringify(arr);
                redis.setCoinRankingList(str);
                next(null, {code: errcode.OK, rankingList: str});
            });
        }
    });
}

handle.editComment = function(msg, session, next){
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    var str = msg.comment;
    userRecord.updateUserByUserId(userId, {comment: str}, function(err){
        if (err){
            return next(null, {code: errcode.MONGO_DATABASE_ERR});
        }
        next(null, {code: errcode.OK, comment: str});
    });
}

handle.editNoticeBoard = function(msg, session, next){
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    redis.setGameNotice(msg.notice);
    homeRPC.rpcTimerBroadcastNotice(msg.notice);
    next(null, {code: errcode.OK});
}

handle.gainNoticeBoard = function(msg, session, next){
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    redis.getGameNotice(function(err, notice){
        if (err){
            return next(null, {code: errcode.REDIS_DATABASE_ERR});
        }
        if (notice){
            next(null, {code: errcode.OK, notice: notice});
        }else{
            next(null, {code: errcode.OK, notice: ""});
        }
    });
}

handle.bindPromoter = function(msg, session, next){
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    var bindUserNo = msg.bindUserNo;
    httpUtil.bindPromoterRequest({bindUserNo: bindUserNo, userId: userId}, function(err, data){
        if (err){
            return next(null, {code: errcode.PROMOTER_CENTER_ERR});
        }
        if (data.code == errcode.OK){
            next(null, {code: errcode.OK});
        }else{
            if (data.code == 17){
                next(null, {code: errcode.NO_PROMOTER_ACCOUNT});
            }else{
                next(null, {code: data.code});
            }
        }
    });
}

handle.rewardDayFirstShare = function(msg, session, next){
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    redis.existUserShared(userId, function(err, is){
        if (err){
            return next(null, {code: errcode.REDIS_DATABASE_ERR});
        }
        userRecord.getRecord(userId, function(err, record){
            if (err){
                return next(null, {code: errcode.MONGO_DATABASE_ERR});
            }
            var coinNum = record.get("coinNum");
            if (is == 1){
                next(null, {code: errcode.OK, rewardCoin: 0, totalCoin: coinNum});
            }else{
                var num = 0;
                var rand = Math.random();
                configRecord.getConfigShareChance((err, chance)=>{
                    if (err){
                        return next(null, {code: errcode.MONGO_DATABASE_ERR});
                    }
                    if (!chance){
                        return next(null, {code: errcode.FAIL});
                    }
                    if (rand*100 < chance[0].probility){
                        var min = chance[0].min;
                        var max = chance[0].max;
                        num = Math.floor(min + Math.random()*(max-min));
                    }else{
                        var min = chance[1].min;
                        var max = chance[1].max;
                        num = Math.floor(min + Math.random()*(max-min));
                    }
                    var totalCoin = coinNum + num;
                    userRecord.updateUserOptionsByObject(record, {coinNum: totalCoin}, function(err){
                        if (err){
                            return next(null, {code: errcode.MONGO_DATABASE_ERR});
                        }
                        var now = Date.now();
                        var param = {
                            sourceUserId: userId,
                            sourceUserNo: record.get("userNo"),
                            sourceCoin: coinNum,
                            afterSourceCoin: totalCoin,
                            targetUserId: "",
                            targetUserNo: "",
                            targetCoin: 0,
                            afterTargetCoin: 0,
                            tradingCoin: num,
                            reason: 3,
                            timestamp: now,
                        }
                        tradingRecord.addRecord(param);
                        redis.setUserIdToShareTime(userId, now);
                        next(null, {code: errcode.OK, rewardCoin: num, totalCoin: totalCoin});
                    });
                });
            }
        });
    });
}

handle.checkFirstShare = function(msg, session, next){
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    redis.existUserShared(userId, function(err, is){
        console.log(err, is)
        if (err){
            return next(null, {code: errcode.REDIS_DATABASE_ERR});
        }
        if (is == 1){
            next(null, {code: errcode.OK, canShared: 0});
        }else{
            next(null, {code: errcode.OK, canShared: 1});
        }
    });
}

handle.gainShopData = function(msg, session, next){
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    configRecord.getConfigShopData((err, data)=>{
        if (err){
            return next(null, {code: errcode.MONGO_DATABASE_ERR});
        }
        next(null, {code: errcode.OK, shopData: data});
    });
}

handle.buyCoin = function(msg, session, next){
    var self = this;
    var userId = session.uid;
    if (!userId) {
		return next(null, {code: errcode.LOGINED_INVALID});
    }
    var roomId = session.get("roomId");
    var gamePlay = session.get("gamePlay");
    var cash = msg.cash;
    var commerceId = msg.commerceId;
    var coinNum = msg.num;
    var time = Date.now();
    var orderId = commerceId + "-" + time + "-" + util.rand(6);
    redis.setNoPayOrderData(orderId, {userId, cash, coinNum, time});
    if (commerceId == constant.AB_COMMERCE_ID){
        homeRPC.rpcTimerQueryRechargeResult(orderId);
    }
    if (roomId){
        homeRPC.rpcGameRechargeCoin(gamePlay, roomId, userId, (err, data)=>{
            if (err){
                return next(null, {code: errcode.INVALID_GAMEPALY});
            }
            next(null, {code: errcode.OK, orderId: orderId, orderTime: time});
        });
    }else{
        next(null, {code: errcode.OK, orderId: orderId, orderTime: time});
    }
}