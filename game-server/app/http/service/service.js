"use_strict";
const TAG = "http service service.js";
const redis = require("../../redis/redisDb");
const tradingRecord = require("../../parse/TransactionRecord");
const userRecord = require("../../parse/UserRecord");
const configRecord = require("../../parse/Config");
const gamePusher = require("../../pusher/game_push/push");
const constant = require("../../shared/constant");
const errcode = require("../../shared/errcode");


const exp = module.exports;

exp.handleRechargeResult = function(data, next){
    if (data.state == 1){
        redis.getAndDelNoPayOrderData(data.ordernumber, (err, orderStr)=>{
            if (err){
                return next(err);
            }
            if (orderStr){
                exp.saveRecordAddCoin(data, orderStr, next);
            }else{
                next("订单不存在！！");
            }
        });
    }else{
        redis.getUserIdServerId(userId, function(err, serverId){
            if (err){
                return next(err);
            }
            if (serverId){
                gamePusher.pushRechargeResult(userId, serverId, 0, function(){
                    next("支付失败！！");
                });
            }else{
                next("支付失败！！");
            }
        });
    }
}

exp.saveRecordAddCoin = function(data, orderStr, next){
    var orderData = JSON.parse(orderStr);
    var userId = orderData.userId;
    var again = function(){
        tradingRecord.existOrderId(data.ordernumber, (err, is)=>{
            if (err){
                return again();
            }
            if (is){////存在交易记录
                return next();
            }
            userRecord.getRecord(userId, function(err, record){
                if (err){
                    return again();
                }
                var remainderCoin = record.get("coinNum");
                var param = {
                    sourceUserId: userId,
                    sourceUserNo: record.get("userNo"),
                    sourceCoin: remainderCoin,
                    afterSourceCoin: remainderCoin + orderData.coinNum,
                    targetUserId: "",
                    targetUserNo: "",
                    targetCoin: 0,
                    afterTargetCoin: 0,
                    tradingCoin: orderData.coinNum,
                    reason: 2,
                    timestamp: orderData.time,
                    payOrderId: data.orderid,
                    wareOrderId: data.ordernumber,
                    tradingCash: data.money,
                    payMethod: data.payMethod
                }
                tradingRecord.addRecord(param, ()=>{
                    notifyAddCoin(record, orderData, next);
                });
            });
        });
    }
    again();
}

var notifyAddCoin = function(record, orderData, next){
    var userId = record.id;
    var remainderCoin = record.get("coinNum");
    var roomId = record.get("roomId");
    if (roomId){
        const timerRPC = require("../../rpc/timerRPC");
        timerRPC.rpcGamePayCoin(record.get("gamePlay"), roomId, orderData, next);
    }else{
        var coinNum = remainderCoin + orderData.coinNum;
        userRecord.updateUserByUserId(userId, {coinNum: coinNum}, ()=>{
            var again = function(){
                redis.getUserIdServerId(userId, function(err, serverId){
                    if (err){
                        return again();
                    }
                    if (serverId){
                        gamePusher.pushGameCoin(userId, serverId, coinNum, function(){
                            var ret = 1;
                            if (orderData.promoterId){
                                ret = 2;
                            }
                            gamePusher.pushRechargeResult(userId, serverId, ret, next);
                        });
                    }else{
                        next(null, {code: 0});
                    }
                });
            }
            again();
        });
    }
}

exp.handleRewardResult = function(data, next){
    configRecord.getConfigRewardCoin((err, num)=>{
        if (err) {
            return next({code: errcode.MONGO_DATABASE_ERR});
        }
        var userId = data.userId;
        var rewardCoin = num;
        data.coinNum = rewardCoin;
        var promoterId = data.promoterId;
        var again = function(){
            userRecord.getRecord(userId, function(err, record){
                if (err){
                    return again();
                }
                var remainderCoin = record.get("coinNum");
                var param = {
                    sourceUserId: promoterId,
                    sourceUserNo: "",
                    sourceCoin: 0,
                    afterSourceCoin: 0,
                    targetUserId: userId,
                    targetUserNo: record.get("userNo"),
                    targetCoin: remainderCoin,
                    afterTargetCoin: remainderCoin + rewardCoin,
                    tradingCoin: rewardCoin,
                    reason: 4,
                    timestamp: Date.now(),
                }
                tradingRecord.addRecord(param, ()=>{
                    notifyAddCoin(record, data, next);
                });
            });
        }
        again();
    });
} 

exp.handleFreezePlayer = function(data, next){
    var userId = data.userId;
    var again = function(){
        redis.getUserIdServerId(userId, function(err, serverId){
            if (err){
                return again();
            }
            if (serverId){
                gamePusher.pushFreeze(userId, serverId, data.stat, next);
            }else{
                next(null, {code: 0});
            }
        });
    }
    again();
}
