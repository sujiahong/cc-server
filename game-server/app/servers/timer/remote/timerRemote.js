"use strict";
const TAG = "timerRemote.js";
const pusher = require("../../../pusher/game_push/push");
const redis = require("../../../redis/redisDb");
const errcode = require("../../../shared/errcode");
const constant = require("../../../shared/constant");
const httpUtil = require("../../../util/httpUtil");
const util = require("../../../util/utils");
const service = require("../../../http/service/service");

module.exports = function(app){
    console.log(TAG, "timer服务器启动  timerRemote");
    //remote.homeToTimingQueryRechargeResult("523212-1534421570241-256483", ()=>{})
    return new TimerRemote(app);
}

function TimerRemote(app){
    this.app = app;
}

var remote = TimerRemote.prototype;

remote.homeToBroadcastNotice = function(notice, next){
    redis.getAllUserIdServerId(function(err, data){
        if (err){
            return next(null, {code: errcode.REDIS_DATABASE_ERR});
        }
        pusher.pushNotice(data, notice, next);
    });
}

remote.homeToTimingQueryRechargeResult = function(orderId, next){
    let count = 0;
    var timer = setInterval(()=>{
        httpUtil.queryRechargeResult({appid: constant.AB_APP_ID, cporderid: orderId}, (data)=>{
            console.log(TAG, "homeToTimingQueryRechargeResult: ", data, typeof data.transdata);
            var transData = JSON.parse(data.transdata);
            if (transData.code){
                return clearInterval(timer);
            }
            var isSuccess = util.rsaDecode(data.sign, data.transdata);
            if (!isSuccess){
                clearInterval(timer);
                return console.log(TAG, "验证签名失败！！");
            }
            if (transData.result == 0){//////完成交易
                redis.getAndDelNoPayOrderData(orderId, (err, orderStr)=>{
                    console.log(TAG, "homeToTimingQueryRechargeResult: ", err, orderStr);
                    if (err){
                        return;
                    }
                    if (orderStr){/////未支付订单还在
                        var needData = {
                            ordernumber: transData.cporderid,
                            orderid: transData.transid,
                            money: transData.money,
                            payMethod: String(transData.paytype)
                        };
                        service.saveRecordAddCoin(needData, orderStr, (err, res)=>{
                            console.log(TAG, "homeToTimingQueryRechargeResult: ", err, res);
                            clearInterval(timer);
                        });
                    }else{
                        clearInterval(timer);
                    }
                });
            } else if (transData.result == 2){//////订单未支付
                ++count;
                if (count > 5){
                    clearInterval(timer);
                }
            }
        });
    }, 20000);
    next(null, {code: errcode.OK});
}