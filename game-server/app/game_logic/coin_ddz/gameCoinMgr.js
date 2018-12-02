"use strict";
const TAG = "gameCoinDDZMgr.js";
const ddzRedis = require("../../redis/redisCoinDDZ");
const errcode = require("../../shared/errcode");
const constant = require("../../shared/constant");
const combatRecord = require("../../parse/DDZCombatRecord");
const pusher = require("../../pusher/coin_ddz_push/push");
const gamePusher = require("../../pusher/game_push/push");
const util = require("../../util/utils");
const httpUtil = require("../../util/httpUtil");
const baseGameMgr = require("../base/gameMgr");
const expendRecord = require("../../parse/ExpenditureRecord");

var GameCoinDDZMgr = function(app){
    baseGameMgr.call(this);
}

module.exports = GameCoinDDZMgr;

const temp = function(){};
temp.prototype = baseGameMgr.prototype;
GameCoinDDZMgr.prototype = new temp();

const mgr = GameCoinDDZMgr.prototype;

mgr.robLandlord = function(roomId, userId, robScore, next){
    this.getRoomById(roomId, function(ecode, room){
        if (ecode != errcode.OK){
            return next(null, {code: ecode});
        }
        if (userId != room.operateId){
            return next(null, {code: errcode.NOT_YOUR_OPERATION});
        }
        if (room.dealerId){
            return next(null, {code: errcode.DEALER_HAVE_APPEARED});
        }
        if (robScore > 0){
            if (room.isHavePlayerRob(robScore)){
                return next(null, {code: errcode.PLAYER_REDED_CURRENT_SCORE});
            }
        }else if (robScore < 0){
            if (robScore == -2 && !room.isHavePlayerRob(-1)){
                return next(null, {code: errcode.PLAYER_NOT_CALL_LANDLORD});
            }
        }
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_DDZ_ROOM_SEAT});
        }
        if (player.robScore == robScore){
            return next(null, {code: errcode.PLAYER_HAVE_OPERATED});
        }
        if(player.cardInHand.length == 0){
            return next(null, {code: errcode.DDZ_PLAYER_NOT_HAVE_CARD});
        }
        room.clearTimer();
        player.setRobScore(robScore);
        var robData = {userId, robScore};
        room.curOperateData = robData;
        room.recordPlayerOperation(robData);
        if (room.roomLaw == constant.DDZ_PLAY_TYPE.jiaofen)
            room.nextOpPlayerId(userId);
        else
            room.nextRobPlayerId(userId);
        var eecode = room.robLandlord(userId, robScore);
        if (eecode == errcode.ROOM_FLOW_RUN){
            room.clearRun();
            pusher.pushRobLandlord(room, userId, robScore, next);
        }else{
            var dealerId = room.dealerId;
            if (dealerId){  //是否产生地主
                room.operateId = dealerId;
                room.curOperateData = {userId: dealerId};
                var dealer = room.getPlayerByUId(dealerId);
                dealer.appendAuxiliaryCard(room.auxiliaryCards);
                pusher.pushRobLandlord(room, userId, robScore, next);
                room.createTimer(constant.ROOM_TIMEOUT.playTime, room.roundTimeout);
            }else{
                pusher.pushRobLandlord(room, userId, robScore, next);
                room.createTimer(constant.ROOM_TIMEOUT.robLandlordTime, room.roundTimeout);
            }
        }
    });
}

mgr.playCard = function(roomId, userId, cards, next){
    this.getRoomById(roomId, function(ecode, room){
        if (ecode != errcode.OK){
            return next(null, {code: ecode});
        }
        if (userId != room.operateId){
            return next(null, {code: errcode.NOT_YOUR_OPERATION});
        }
        if (cards.length == 0 && userId == room.curOperateData.userId){
            return next(null, {code: errcode.PLAYER_CAN_NOT_PASS});
        }        
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_DDZ_ROOM_SEAT});
        }
        if(player.cardInHand.length == 0){
            return next(null, {code: errcode.DDZ_PLAYER_NOT_HAVE_CARD});
        }
        var eecode = room.playCard(userId, cards);
        if (eecode != errcode.OK){
            return next(null, {code: eecode});
        }
        room.clearTimer();
        room.recordPlayerOperation({userId, cards});
        room.nextOpPlayerId(userId);
        if (player.cardInHand.length == 0){
            room.operateId = "";
            pusher.pushPlayCard(room, userId, cards, function(){
                var ret = room.startScore(player);
                saveRunEndData(room, ret, ()=>{
                    room.clearRun();
                });
                pusher.pushResult(room, ret, next);
            });
        }else{
            room.nextOpPlayerId(userId);
            pusher.pushPlayCard(room, userId, cards, next);
            if(room.getPlayerByUId(room.operateId).trusteeStat == 1){
                room.createTimer(constant.ROOM_TIMEOUT.trusteePlayTime, room.roundTimeout);
            }else{
                room.createTimer(constant.ROOM_TIMEOUT.playTime, room.roundTimeout);
            }
        }
    });
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
            for (let uid in players){
                var player = players[uid];
                if (player.readyStat == 1){
                    room.saveRedisCombatGain(uid, combatRecord);
                    var param = {
                        userId: uid,
                        userNo: player.userNo,
                        nickname: player.nickname,
                        coinNum: player.coinNum,
                        roomId: room.roomId,
                        gamePlay: room.gamePlay,
                        roomFee: room.baseCoin*(constant.ROOM_FEE_RATE[room.baseCoin] || constant.DDZ_RATE),
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
    util.generateUniqueId(8, ddzRedis.isExistViewId, function(viewId){
        var param = {
            roomId: room.roomId,
            roomType: room.roomType,
            roomLaw: room.roomLaw,
            baseCoin: room.baseCoin,
            startStamp: room.startStamp,
            endStamp: room.endStamp,
            viewCodeId: viewId,
            uplimitPersons: room.uplimitPersons,
            rulePlay: room.rulePlay,
            operationArray: room.operationDataArr,
            auxiliaryCards: room.auxiliaryCards,
            dealerId: room.dealerId,
            multiple: room.multiple,
            bombNum: room.totalBombNum,
            players: []
        };
        var players = room.players;
        for (var uid in players){
            var player = players[uid];
            if (player.readyStat == 1){
                var resData = {
                    userId: uid,
                    userNo: player.userNo,
                    seatIdx: player.seatIdx,
                    nickname: player.nickname,
                    userIcon: player.userIcon,
                    remainderCoin: player.coinNum,
                    coinIncr: player.coinIncr
                };
                var consumeCoin = 0;
                var scoreData = scoreRet[uid];
                if (scoreData.win < 0){
                    consumeCoin = player.coinIncr;
                }
                var record = {
                    userId: uid,
                    nickname: player.nickname,
                    roomId: room.roomId,
                    roomType: room.roomType,
                    roomLaw: room.roomLaw,
                    gamePlay: room.gamePlay,
                    coinNum: consumeCoin,
                    roomFee: room.baseCoin * (constant.ROOM_FEE_RATE[room.baseCoin] || constant.DDZ_RATE),
                }
                expendRecord.addRecord(record);
                param.players.push(resData);
            }
        }
        combatRecord.addRecord(param, function(err, record){
            if (err){
                return next(err);
            }
            ddzRedis.setViewIdCombatId(viewId, record.id.toString());
            next(null, record);
        });
    });
}

mgr.abrogateTrustee = function(roomId, userId, next){
    this.getRoomById(roomId, function(ecode, room){
        if (ecode != errcode.OK){
            return next(null, {code: ecode});
        }
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_DDZ_ROOM_SEAT});
        }
        if(player.cardInHand.length == 0){
            return next(null, {code: errcode.DDZ_PLAYER_NOT_HAVE_CARD});
        }
        if (player.trusteeStat == 0){
            return next(null, {code: errcode.PLAYER_NOT_IN_TRUSTEE});
        }
        player.setTrustee(0);
        pusher.pushTrusteeship(room, userId, 0, next);
    });
}

mgr.comeinTrustee = function(roomId, userId, next){
    this.getRoomById(roomId, function(ecode, room){
        if (ecode != errcode.OK){
            return next(null, {code: ecode});
        }
        var player = room.getPlayerByUId(userId);
        if (!player){
            return next(null, {code: errcode.NOT_IN_DDZ_ROOM_SEAT});
        }
        if(player.cardInHand.length == 0){
            return next(null, {code: errcode.DDZ_PLAYER_NOT_HAVE_CARD});
        }
        if (player.trusteeStat == 1){
            return next(null, {code: errcode.PLAYER_HAVE_IN_TRUSTEE});
        }
        player.setTrustee(1);
        pusher.pushTrusteeship(room, userId, 1, next);
    });
}