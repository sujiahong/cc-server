"use strict";
const TAG = "gameKengMgr.js";
const kengRedis = require("../../redis/redisCoinKeng");
const errcode = require("../../shared/errcode");
const constant = require("../../shared/constant");
const combatRecord = require("../../parse/KengCombatRecord");
const pusher = require("../../pusher/keng_push/push");
const gamePusher = require("../../pusher/game_push/push");
const util = require("../../util/utils");
const httpUtil = require("../../util/httpUtil");
const expendRecord = require("../../parse/ExpenditureRecord");
const baseGameMgr = require("../base/gameMgr");

var GameKengMgr = function(){
    baseGameMgr.call(this);
}

module.exports = GameKengMgr;

const temp = function(){};
temp.prototype = baseGameMgr.prototype;
GameKengMgr.prototype = new temp();

var mgr = GameKengMgr.prototype;

////handler
mgr.betCoin = function(roomId, userId, msg, next){
    var coin = msg.coin;
    var operation = msg.operation;
    this.getRoomById(roomId, function(ecode, room){
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_KENG_ROOM_SEAT});
        }
        if(player.cardInHand.length == 0){
            return next(null, {code: errcode.KENG_PLAYER_NOT_HAVE_CARD});
        }
        if (room.betCoinStat == 1){//下注
            if (player.betCoin == coin){
                return next(null, {code: errcode.KENG_ROOM_HAVE_BETED});
            }
            // if (coin > room.baseCoin*5*(room.noWinnerStat+1)){
            //     return next(null, {code: errcode.PLAYER_BET_COIN_UPLIMIT});
            // }
            if (coin > player.coinNum){
                return next(null, {code: errcode.COIN_NOT_ENOUGH});
            }
            room.clearTimer();
            var startId = room.getStartId();
            var startPlayer = room.getPlayerByUId(startId);
            if (startId != userId && coin != startPlayer.betCoin){
                return next(null, {code: errcode.FLLOW_SAME_WITH_BET});
            }
            var round = room.getRoundCount();
            player.setBetData(coin, room.betCoinStat, round, operation);
            room.totalCoin += coin;
            room.maxBetCoin = coin;
            room.recordPlayerOperation({userId, coin, round, operation});
            room.nextOpPlayerId(userId);
            betNextBetCoin(room, userId, msg, startId, next);
        }else if (room.betCoinStat == 2){//加注
            if (player.betCoin == coin){
                return next(null, {code: errcode.KENG_ROOM_HAVE_APPENDED});
            }
            // if (coin > room.baseCoin*5*(room.noWinnerStat+1)){
            //     return next(null, {code: errcode.PLAYER_BET_COIN_UPLIMIT});
            // }
            if (coin > player.coinNum){
                return next(null, {code: errcode.COIN_NOT_ENOUGH});
            }
            room.clearTimer();
            var appendId = room.appendBetCoinId;
            if (appendId == userId){//加注者行为
                var round = room.getRoundCount();
                player.setBetData(coin, room.betCoinStat, round, operation);
                room.totalCoin += coin;
                if (coin != 0){
                    room.maxBetCoin = coin;
                }
                room.recordPlayerOperation({userId, coin, round, operation});
                room.nextOpPlayerId(userId);
                if (coin == 0){////不加
                    room.nextAppendPlayerId(appendId);
                    if (room.appendBetCoinId == room.getStartId()){
                        pusher.pushBetCoin(room, userId, msg, "", function(){
                            roomRoundorRunEnd(room, next);
                        });
                    }else{
                        pusher.pushBetCoin(room, userId, msg, room.appendBetCoinId, next);
                        room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
                    }
                }else{/////////加
                    room.appendIdArr.push(appendId);
                    pusher.pushBetCoin(room, userId, msg, room.appendBetCoinId, next);
                    room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
                }
            }else{ ////////////////其他玩家行为（跟注/弃牌）
                if (appendId){
                    var appendPlayer = room.getPlayerByUId(appendId);
                    if (coin < appendPlayer.betCoin){
                        return next(null, {code: errcode.FLLOW_SAME_WITH_BET});
                    }
                    var round = room.getRoundCount();
                    player.setBetData(coin, room.betCoinStat, round, operation);
                    room.totalCoin += coin;
                    room.maxBetCoin = coin;
                    room.recordPlayerOperation({userId, coin, round, operation});
                    room.nextOpPlayerId(userId);
                    betNextAppendCoin(room, userId, msg, next);
                }else{
                    console.log(TAG, "没有加注的人！！！", appendId);
                }
            }
        }else{
            next(null, {code: errcode.FAIL});
        }
    });
}

var betNextBetCoin = function(room, userId, msg, startId, next){
    if (room.operateId == startId){//下注结束
        if (room.rulePlay.daiti == 1){
            room.betCoinStat = 2;
            room.appendBetCoinId = startId;
            room.clearPlayerBetCoin();
            pusher.pushBetCoin(room, userId, msg, startId, next);
            room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
        }else{
            pusher.pushBetCoin(room, userId, msg, "", function(){
                roomRoundorRunEnd(room, next);
            });
        }
    }else{
        pusher.pushBetCoin(room, userId, msg, startId, next);
        room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
    }
}

var betNextAppendCoin = function(room, userId, msg, next){
    var appendId = room.appendBetCoinId;
    if (room.operateId == appendId){///////操作者ID回到加注者ID, 换一个加注者
        room.nextAppendPlayerId(appendId);
        room.clearPlayerBetCoin();
        if (room.appendBetCoinId == room.getStartId()){
            pusher.pushBetCoin(room, userId, msg, "", function(){
                roomRoundorRunEnd(room, next);
            });
        }else{
            pusher.pushBetCoin(room, userId, msg, room.appendBetCoinId, next);
            room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
        }
    }else{
        pusher.pushBetCoin(room, userId, msg, room.appendBetCoinId, next);
        room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
    }
}

var roomRoundorRunEnd = function(room, next){
    if (room.isRunEnd()){
        var ret = room.startScore();
        if (room.noWinnerStat > 0){
            pusher.pushResult(room, ret, function(){
                room.clearNoWinRun();
                room.lookupFirstId();
                room.startNoWinnerRun();
                room.lookupStartId();
                gamePusher.pushHandCard(room, next);
                room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
            });
        }else{
            //var saveRoomData = util.clone(room);
            saveRunEndData(room, ret, ()=>{
                room.clearRun();
            });
            pusher.pushResult(room, ret, next);
        }
    }else{
        room.clearRound();
        room.lookupFirstId();
        room.dealCard(1);
        room.lookupStartId();
        pusher.pushOneCard(room, next);
        room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
    }
}

mgr.discard = function(roomId, userId, next){
    this.getRoomById(roomId, function(ecode, room){
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_KENG_ROOM_SEAT});
        }
        if (player.discardStat == 1){
            return next(null, {code: errcode.KENG_ROOM_HAVE_DISCARDED});
        }
        if(player.cardInHand.length == 0){
            return next(null, {code: errcode.KENG_PLAYER_NOT_HAVE_CARD});
        }
        if (room.rulePlay.zhuaApao == 1 && player.isHaveA() && 
        room.betCoinStat == 1 && userId == room.getStartId()){
            if (room.baseCoin*5*(room.noWinnerStat+1) <= player.coinNum){
                return next(null, {code: errcode.ZHUA_A_BI_PAO});
            }
        }
        room.clearTimer();
        player.setDiscardStat(1);
        var round = room.getRoundCount();
        player.setBetData(-1, room.betCoinStat, round, -1);
        room.recordPlayerOperation({userId: userId, coin: -1, round: round, operation: -1});
        var underwayArr = room.getUnderwayPlayerArr();
        if (underwayArr.length > 1){
            if (room.getStartId() == userId){
                if (room.betCoinStat == 1){
                    room.removeStartId();
                    room.lookupStartId();
                    pusher.pushDiscard(room, userId, room.getStartId(), next);
                    room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
                }else{
                    room.nextOpPlayerId(userId);
                    discardNextAppendCoin(room, userId, next);
                }
            }else{
                room.nextOpPlayerId(userId);
                if (room.betCoinStat == 1){
                    discardNextBetCoin(room, userId, room.getStartId(), next);
                }else if (room.betCoinStat == 2){
                    discardNextAppendCoin(room, userId, next);
                }else{
                    next(null, {code: errcode.FAIL});
                }
            }
        }else{
            var stakeId = "";
            if (room.betCoinStat == 1){
                stakeId = room.getStartId();
            }else if(room.betCoinStat == 2){
                stakeId = room.appendBetCoinId;
            }
            pusher.pushDiscard(room, userId, stakeId, function(){
                var ret = room.startScore(underwayArr[0]);
                saveRunEndData(room, ret, ()=>{
                    room.clearRun();
                });
                pusher.pushResult(room, ret, next);
            });
        }
    });
}

var discardNextBetCoin = function(room, userId, startId, next){
    if (room.operateId == startId){//下注结束
        if (room.rulePlay.daiti == 1){
            room.betCoinStat = 2;
            room.appendBetCoinId = startId;
            room.clearPlayerBetCoin();
            pusher.pushDiscard(room, userId, startId, next);
            room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
        }else{
            pusher.pushDiscard(room, userId, "", function(){
                roomRoundorRunEnd(room, next);
            });
        }
    }else{
        pusher.pushDiscard(room, userId, startId, next);
        room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
    }
}

var discardNextAppendCoin = function(room, userId, next){
    var appendId = room.appendBetCoinId;
    if (room.operateId == appendId){///////操作者ID回到加注者ID, 换一个加注者
        room.nextAppendPlayerId(appendId);
        room.clearPlayerBetCoin();
        if (room.appendBetCoinId == room.getStartId()){
            pusher.pushDiscard(room, userId, "", function(){
                roomRoundorRunEnd(room, next);
            });
        }else{
            pusher.pushDiscard(room, userId, room.appendBetCoinId, next);
            room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
        }
    }else{
        pusher.pushDiscard(room, userId, room.appendBetCoinId, next);
        room.createTimer(constant.ROOM_TIMEOUT.betTime, room.roundTimeout);
    }
}

var saveRunEndData = function(room, ret, next){
    var _save = function(){
        saveMongoCombatGain(room, ret, function(err, combatRecord){
            if (err){
                console.warn(TAG, "saveRunEndData 保存战绩mongo出错, 3妙后再试一次！！", err);
                return setTimeout(_save, 3000);
            }
            var rebateData = {};
            var players = room.players;
            for (var uid in players){
                var player = players[uid];
                if (player.readyStat == 1 && player.cardInHand.length > 0){
                    room.saveRedisCombatGain(uid, combatRecord);
                    var param = {
                        userId: uid,
                        userNo: player.userNo,
                        nickname: player.nickname,
                        coinNum: player.coinNum,
                        roomId: room.roomId,
                        gamePlay: constant.GAME_PLAY.tian_da_keng,
                        roomFee: room.baseCoin*(constant.ROOM_FEE_RATE[room.baseCoin] || constant.KENG_RATE),
                        upPromoterId: player.bindId,
                        upUserNo: player.bindUserNo
                    };
                    rebateData[uid] = JSON.stringify(param);
                }
            }
            console.log(TAG, "saveRunEndData  rebateData:", rebateData);
            httpUtil.rebateRoomFeeToPromoter(rebateData);
            next ? next() : null;
        });
    }
    _save();
}

var saveMongoCombatGain = function(room, scoreRet, next){
    util.generateUniqueId(8, kengRedis.isExistViewId, function(viewId){
        var param = {
            roomId: room.roomId,
            roomType: room.roomType,
            roomLaw: room.roomLaw,
            baseCoin: room.baseCoin,
            totalCoin: room.totalCoin,
            startStamp: room.startStamp,
            endStamp: room.endStamp,
            viewCodeId: viewId,
            uplimitPersons: room.uplimitPersons,
            rulePlay: room.rulePlay,
            operationArray: room.operationDataArr,
            players: []
        };
        var players = room.players;
        for (var uid in players){
            var player = players[uid];
            if (player.readyStat == 1 && player.cardInHand.length > 0){
                var resData = {
                    userId: uid,
                    userNo: player.userNo,
                    seatIdx: player.seatIdx,
                    nickname: player.nickname,
                    userIcon: player.userIcon,
                    coinIncr: 0,
                    remainderCoin: player.coinNum,
                };
                var consumeCoin = 0;
                var scoreData = scoreRet[uid];
                if (scoreData.win > 0){
                    resData.coinIncr = room.totalCoin - player.totalCoin;
                }else{
                    resData.coinIncr = -player.totalCoin
                    consumeCoin = player.totalCoin;
                }
                var record = {
                    userId: uid,
                    nickname: player.nickname,
                    roomId: room.roomId,
                    roomType: room.roomType,
                    roomLaw: room.roomLaw,
                    gamePlay: constant.GAME_PLAY.tian_da_keng,
                    coinNum: consumeCoin,
                    roomFee: room.baseCoin * (constant.ROOM_FEE_RATE[room.baseCoin] || constant.KENG_RATE),
                }
                expendRecord.addRecord(record);
                param.players.push(resData);
            }
        }
        combatRecord.addRecord(param, function(err, record){
            if (err){
                return next(err);
            }
            kengRedis.setViewIdCombatId(viewId, record.id.toString());
            next(null, record);
        });
    });
}