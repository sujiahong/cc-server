"use_strict";
const TAG = "player.js";
const errcode = require("../../shared/errcode");
const constant = require("../../shared/constant");
const userRecord = require("../../parse/UserRecord");

var Player = function(){
    this.roomId = "";
    this.seatIdx = 0;
    this.userId = "";

    this.frontServerId = "";
    this.location = "";
    this.userNo = "";
    this.nickname = "";
    this.loginIp = "";
    this.userIcon = "";
    this.sex = 0;
    this.clientPlat = "";
    this.bindId = "";
    this.bindUserNo = "";
    this.coinNum = 0;

    this.readyStat = 0;
    this.matchStat = 0;
}
module.exports = Player;

var player = Player.prototype;

player.init = function(userId, serverId, next){
    var self = this;
    self.userId = userId;
    self.frontServerId = serverId;
    userRecord.getRecord(userId, function(err, record){
        if (err){
            return next(errcode.MONGO_DATABASE_ERR, err);
        }
        self.roomId = record.get("roomId");
        self.userNo = record.get("userNo");
        self.nickname = record.get("nickname");
        self.loginIp = record.get("loginIp");
        self.userIcon = record.get("userIconUrl");
        self.coinNum = record.get("coinNum");
        self.sex = record.get("sex");
        self.location = record.get("location");
        self.clientPlat = record.get("clientPlat");
        self.bindId = record.get("bindId");
        self.bindUserNo = record.get("bindUserNo");
        next(errcode.OK, record);
    });
}

player.refresh = function(userId, serverId, next){
    var self = this;
    self.frontServerId = serverId;
    userRecord.getRecord(userId, function(err, record){
        if (err){
            return next(errcode.MONGO_DATABASE_ERR, err);
        }
        self.nickname = record.get("nickname");
        self.loginIp = record.get("loginIp");
        self.userIcon = record.get("userIconUrl");
        self.coinNum = record.get("coinNum");
        self.sex = record.get("sex");
        self.location = record.get("location");
        next(errcode.OK);
    });
}

player.setRoomId = function(roomId){
    this.roomId = roomId;
}

player.setSeatIdx = function(idx){
    this.seatIdx = idx;
}

player.setReady = function(stat){
    this.readyStat = stat;
}

player.clearPlayer = function(){
    this.seatIdx = 0;
    this.roomId = "";
    this.matchStat = 0;
    this.clearOneRunPlayer();
}