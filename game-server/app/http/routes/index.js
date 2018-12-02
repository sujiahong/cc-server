"use_strict";
const TAG = "http/routes/index.js";
const express = require('express');
const router = express.Router();
const queryString = require("querystring");
const service = require("../service/service");
const util = require("../../util/utils");
const compkey = require("../../../config/myconfig.json").compkey;
const pomelo = require("pomelo");
const app = pomelo.app;

router.get("/", (req, res)=>{
    var server = app.getCurServer();
    console.log(TAG, server)
    res.send("hello, I am http server!");
});

router.post("/notifyRechargeResult", (req, res, next)=>{
    var data = req.body;
    console.log(TAG, "notifyRechargeResult 充值成功通知回调 ", data);
    var sign = util.md5(data.p1_yingyongnum + "&" + data.p2_ordernumber + "&" + data.p3_money +
    "&" + data.p4_zfstate + "&" + data.p5_orderid + "&" + data.p6_productcode + 
    "&" + data.p7_bank_card_code + "&" + data.p8_charset + "&" + data.p9_signtype + 
    "&" + data.p11_pdesc + "&" + compkey).toUpperCase();
    if (sign != data.p10_sign){
        console.log(TAG, "notifyRechargeResult 验签失败！！");
        return res.send("success");
    }
    var needData = {
        state: data.p4_zfstate,
        ordernumber: data.p2_ordernumber,
        orderid: data.p5_orderid,
        money: Number(data.p3_money),
        payMethod: data.p6_productcode
    };
    service.handleRechargeResult(needData, function(err, result){
        console.log(TAG, err, result);
        res.send("success");
    });
});

router.post("/notifyRechargeResultAB", (req, res, next)=>{
    console.log(TAG, "notifyRechargeResultAB 充值成功通知回调 ", req.body, typeof req.body);
    var data = req.body;
    var transData = JSON.parse(data.transdata);
    var isVerify = util.rsaDecode(data.sign, data.transdata);
    if (!isVerify){
        console.log(TAG, "notifyRechargeResultAB 验签失败！！");
        return res.send("SUCCESS");
    }
    var state = 1;
    if(transData.result == 1){
        state = 0;
    }
    var needData = {
        state: state,
        ordernumber: transData.cporderid,
        orderid: transData.transid,
        money: transData.money,
        payMethod: String(transData.paytype)
    };
    service.handleRechargeResult(needData, function(err, result){
        console.log(TAG, err, result);
        res.send("SUCCESS");
    });
});

router.post("/promoterRewardCoin", (req, res, next)=>{
    service.handleRewardResult(req.body, (err, result)=>{
        res.send({code: 0});
    });
});

router.post("/freezePlayer", (req, res, next)=>{
    service.handleFreezePlayer(req.body, (err, result)=>{
        res.send({code: 0});
    });
});


module.exports = router;
