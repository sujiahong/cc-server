"use_strict";
const TAG = "TransactionRecord.js";
const pomelo = require("pomelo");
var Parse = pomelo.app.get("Parse");
var Transaction = Parse.Object.extend("transactionRecord");

var exp = module.exports;

/*
param = {
    sourceUserId: "",
    sourceUserNo: "",
    sourceCoin: 0,
    afterSourceCoin: 0,
    targetUserId: "",
    targetUserNo: "",
    targetCoin: 0,
    afterTargetCoin: 0,
    tradingCoin: 0,
    reason: 1/2/3,
    timestamp: 0,
}
*/

exp.addRecord = function(param, callback){
    var record = new Transaction();
    param.payOrderId = param.payOrderId || "";
    param.wareOrderId = param.wareOrderId || "";
    param.tradingCash = param.tradingCash || 0;
    param.payMethod = param.payMethod || "";
    var _add = function(){
        record.save(param, {
            success: function(ret){
                callback ? callback(null, ret) : null;
            },
            error: function(object, error){
                console.log(TAG, "addRecord error", error);
                setTimeout(_add, 1000);
            }
        });
    }
    _add();
}

exp.existOrderId = function(orderId, callback){
    var query = new Parse.Query(Transaction);
    query.equalTo("wareOrderId", orderId);
    query.find({
        success: function(records){
            callback(null, records.length != 0);
        },
        error: function(res, error){
            callback(error);
        }
    });
}