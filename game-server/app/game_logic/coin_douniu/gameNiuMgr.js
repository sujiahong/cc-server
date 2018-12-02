"use strict";
const TAG = "gameNiuMgr.js";
const niuRedis = require("../../redis/redisCoinNiu");
const errcode = require("../../shared/errcode");
const constant = require("../../shared/constant");
const combatRecord = require("../../parse/NiuCombatRecord");
const pusher = require("../../pusher/coin_niu_push/push");
const util = require("../../util/utils");
const httpUtil = require("../../util/httpUtil");
const expendRecord = require("../../parse/ExpenditureRecord");
const baseGameMgr = require("../base/gameMgr");

var GameNiuMgr = function(){
    baseGameMgr.call(this);
}

module.exports = GameNiuMgr;

const temp = function(){};
temp.prototype = baseGameMgr.prototype;
GameNiuMgr.prototype = new temp();

var mgr = GameNiuMgr.prototype;

mgr.robBanker = function(roomId, userId, multi, next){
    this.getRoomById(roomId, function(ecode, room){
        if (ecode != errcode.OK){
            return next(null, {code: ecode});
        }
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_NIU_ROOM_SEAT});
        }
        if (player.multiple > -1){
            return next(null, {code: errcode.NIU_ROOM_HAVE_ROBED});
        }
        if (player.coinNum < multi * 40 * room.baseCoin * (room.getPlayerNum() - 1)){
            return next(null, {code: errcode.COIN_NOT_ENOUGH});
        }
        if (room.bankerId){
            return next(null, {code: errcode.NIU_ROOM_HAVE_BANKER});
        }
        player.robMultiple(multi);
        var multiAndEndArr = room.getMaxMultiAndEnd();
        console.log("#####  ", multiAndEndArr);
        if (multiAndEndArr[1]){//抢庄结束
            room.clearTimer();
            room.bankerId = room.lookupBanker(multiAndEndArr[0]);
            pusher.pushMultiple(room, userId, 1, next);
            room.createTimer(constant.ROOM_TIMEOUT.robMultiTime, room.roundTimeout);
        }else{
            pusher.pushMultiple(room, userId, 1, next);
        }
    });
}

mgr.robMultiple = function(roomId, userId, multi, next){
    this.getRoomById(roomId, function(ecode, room){
        if (ecode != errcode.OK){
            return next(null, {code: ecode});
        }
        var banker = room.getPlayerByUId(room.bankerId);
        if (!banker){
            return next(null, {code: errcode.NIU_ROOM_NOT_HAVE_BANKER});
        }
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_NIU_ROOM_SEAT});
        }
        if (player.multiple > -1){
            return next(null, {code: errcode.NIU_ROOM_HAVE_CALL_MULTI});
        }
        if (player.coinNum < multi * banker.multiple * 8 * room.baseCoin){
            return next(null, {code: errcode.COIN_NOT_ENOUGH});
        }
        player.robMultiple(multi);
        console.log("#$$$$$$$  ", room.isRobMultipleEnd());
        if (room.isRobMultipleEnd()){
            room.clearTimer();
            pusher.pushMultiple(room, userId, 2, function(){
                pusher.pushOneCard(room, next);
                room.createTimer(constant.ROOM_TIMEOUT.flopTime, room.roundTimeout);
            });
        }else{
            pusher.pushMultiple(room, userId, 2, next);
        }
    });
}

mgr.flop = function(roomId, userId, next){
    this.getRoomById(roomId, function(ecode, room){
        if (ecode != errcode.OK){
            return next(null, {code: ecode});
        }
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_NIU_ROOM_SEAT});
        }
        if (player.flopStat == 1){
            return next(null, {code: errcode.NIU_ROOM_HAVE_FLOPED});
        }
        if(player.cardInHand.length == 0){
            return next(null, {code: errcode.PLALYER_NOT_HAVE_CARD});
        }
        player.setFlopStat(1);
        var cards = [];
        for (var i = 0, len = player.cardInHand.length; i < len; ++i){
            cards[i] = player.cardInHand[i];
        }
        player.niuInHand = room.findoutNiuType(player.cardInHand);
        console.log(player.cardInHand, "222222222222  ", room.isFlopEnd(), player.niuInHand)
        if (room.isFlopEnd()){
            room.clearTimer();
            pusher.pushFlop(room, {[userId]: [cards, player.niuInHand]}, function(){
                var ret = room.startScore();
                saveRoundEndData(room, ret, ()=>{
                    room.clearRun();
                });
                pusher.pushResult(room, ret, next);
            });
        }else{
            pusher.pushFlop(room, {[userId]: [cards, player.niuInHand]}, next);
        }
    });
}

var saveRoundEndData = function(room, ret, next){
    var _save = function(){
        saveMongoCombatGain(room, ret, function(err, combatRecord){
            if (err){
                console.warn(TAG, "saveRoundEndData 保存战绩mongo出错, 3妙后再试一次！！", err);
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
                        gamePlay: constant.GAME_PLAY.niu_niu,
                        roomFee: room.baseCoin*(constant.ROOM_FEE_RATE[room.baseCoin] || constant.NIU_RATE),
                        upPromoterId: player.bindId,
                        upUserNo: player.bindUserNo
                    };
                    rebateData[uid] = JSON.stringify(param);
                }
            }
            console.log(TAG, "saveRoundEndData  rebateData:", rebateData);
            httpUtil.rebateRoomFeeToPromoter(rebateData);
            next ? next() : null;
        });
    }
    _save();
}

var saveMongoCombatGain = function(room, scoreRet, next){
    util.generateUniqueId(8, niuRedis.isExistViewId, function(viewId){
        var param = {
            roomId: room.roomId,
            roomType: room.roomType,
            roomLaw: room.roomLaw,
            bankerId: room.bankerId,
            baseCoin: room.baseCoin,
            startStamp: room.startStamp,
            endStamp: room.endStamp,
            viewId: viewId,
            players: []
        };
        for (var uid in room.players){
            var player = room.players[uid];
            if (player.readyStat == 1 && player.cardInHand.length > 0){
                var coinIncr = scoreRet[uid].coinIncr;
                var resData = {
                    userId: uid,
                    nickname: player.nickname,
                    iconUrl: player.userIcon,
                    handCard: player.cardInHand,
                    niuType: player.niuInHand.type,
                    niu: player.niuInHand.niu,
                    aux:player.niuInHand.aux,
                    multi: player.multiple,
                    remainderCoin: player.coinNum,
                    coinIncr: coinIncr
                };
                param.players.push(resData);
                var consumeCoin = 0;
                if (coinIncr < 0){
                    consumeCoin = Math.abs(coinIncr);
                }
                var record = {
                    userId: uid,
                    nickname: player.nickname,
                    roomId: room.roomId,
                    roomType: room.roomType,
                    roomLaw: room.roomLaw,
                    gamePlay: constant.GAME_PLAY.niu_niu,
                    coinNum: consumeCoin,
                    roomFee: room.baseCoin*(constant.ROOM_FEE_RATE[room.baseCoin] || constant.NIU_RATE),
                }
                expendRecord.addRecord(record);
            }
        }
        combatRecord.addRecord(param, function(err, record){
            if (err){
                return next(err);
            }
            niuRedis.setViewIdCombatId(viewId, record.id.toString());
            next(null, record);
        });
    });
}