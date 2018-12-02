"use_strict";
const TAG = "room.js";
const constant = require("../../shared/constant");
const errcode = require("../../shared/errcode");
const playConfig = require("../../shared/playConfig");
const utils = require("../../util/utils");

var Room = function(){
    this.roomId = "";
    this.creatorId = "";
    this.roomType = 0;
    this.gamePlay = 0;
    this.players = {}; //玩家们
    this.witnessPlayers = {}; //观战玩家们
    this.curRunCount = 0; //
    this.startStamp = 0; //开始时间戳
    this.endStamp = 0; //结束时间戳
    this.timer = null;
    this.waitTimer = null;

    this.roomPokerCards = [];////房间poker
    this.roomLaw = 0;  // 
    this.baseCoin = 1;  //底分
    this.rulePlay = {};
    this.uplimitPersons = 0; //上限人数
    this.GPSActive = 0;
    this.midJoinStat = 0;

    this.operationDataArr = [];  ///操作流水
}

module.exports = Room;

var room = Room.prototype;

room.initBase = function (roomId, rule) {
    this.roomId = roomId;
    this.roomLaw = rule.roomLaw;
    this.roomType = rule.roomType;
    this.gamePlay = rule.gamePlay;
    this.uplimitPersons = rule.maxPersons;
    this.GPSActive = rule.GPSActive;
    this.midJoinStat = rule.midJoinStat;
    this.baseCoin = rule.baseCoin;
    this.rulePlay = rule.rulePlay;
}

room.recordPlayerOperation = function(data){
    this.operationDataArr.push(data);
}

room.createTimer = function(second, callFunc){
    var self = this;
    if (!self.timer){
        self.timer = setTimeout(function(){
            self.timer = null;
            callFunc(self);
        }, second);
    }
}

room.clearTimer = function(){
    var self = this;
    if (self.timer){
        clearTimeout(self.timer);
        self.timer = null;
    }
}

room.refreshTimer = function(second){
    var self = this;
    if (self.timer){
        var handler = self.timer._onTimeout;
        clearTimeout(self.timer);
        self.timer = setTimeout(handler, second);
    }else{
        console.log("没有刷新的定时器!!");
    }
}

room.createWaitTimer = function(second, callFunc){
    var self = this;
    if (!self.waitTimer){
        self.waitTimer = setTimeout(()=>{
            self.waitTimer = null;
            callFunc(self);
        }, second);
    }else{
        self.clearWaitTimer();
        self.waitTimer = setTimeout(()=>{
            self.waitTimer = null;
            callFunc(self);
        }, second);
    }
}

room.clearWaitTimer = function(){
    var self = this;
    if (self.waitTimer){
        clearTimeout(self.waitTimer);
        self.waitTimer = null;
    }
}

room.getPlayerByUId = function(userId){
    return this.players[userId];
}

room.getWitnessPlayerByUid = function(userId){
    return this.witnessPlayers[userId];
}

room.getPlayerNum = function(){
    return utils.objectSize(this.players);
}

room.getRoomPlayerNum = function(){
    return utils.objectSize(this.players) + utils.objectSize(this.witnessPlayers);
}

room.getUnderwayPlayerArr = function(){
    var arr = [];
    var players = this.players;
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1 && player.discardStat == 0 && player.cardInHand.length > 0){
            arr.push(player);
        }
    }
    return arr;
}

room.selectedSeat = function(userId, seatIdx){
    var player = this.witnessPlayers[userId];
    if(player){
        if (this.isHavePlayerInSeat(seatIdx)){
            return errcode.ZJH_PLAYER_HAVE_IN_SEAT;
        }
        this.players[userId] = player;
        player.seatIdx = seatIdx;
        delete this.witnessPlayers[userId];
        return errcode.OK;
    }
    return errcode.NOT_IN_NIU_ROOM_WITNESS;
}

room.getVacantSeatIdx = function(){
    for (var i = 1; i <= this.uplimitPersons; ++i){
        if (!this.isHavePlayerInSeat(i)){
            return i;
        }
    }
    return 0;
}

room.shuffleCard = function(){
    var roomCards = this.roomPokerCards;
    for (var j = 0, len = roomCards.length; j < len; ++j){
        var ram = Math.floor(Math.random() * len);
        var cardId = roomCards[j];
        roomCards[j] = roomCards[ram];
        roomCards[ram] = cardId;
    }
}

room.getNextSeatPlayerId = function(seatIdxPlayerId, maxNum, curIdx){
    //console.log(TAG, seatIdxPlayerId, maxNum, curIdx)
    var nextIdx = curIdx;
    var uid = seatIdxPlayerId[nextIdx];
    if (uid){
        return uid;
    }
    nextIdx = nextIdx % maxNum + 1;
    while(nextIdx != curIdx){
        var uid = seatIdxPlayerId[nextIdx];
        if (uid){
            return uid;
        }
        nextIdx = nextIdx % maxNum + 1;
    }
    return "";
}

room.leaveRoom = function(userId){
    var player = this.players[userId];
    if (player){
        player.clearPlayer();
        delete this.players[userId];
        if (this.getPlayerNum() == 0){
            this.clearRun();
        }
        return errcode.OK;
    }else{
        player = this.witnessPlayers[userId];
        if (player){
            player.clearPlayer();
            delete this.witnessPlayers[userId];
            if (this.getPlayerNum() == 0){
                this.clearRun();
            }
            return errcode.OK;
        }else{
            if (this.getPlayerNum() == 0){
                this.clearRun();
            }
            return errcode.NOT_IN_ROOM;
        }
    }
}

room.isInRoom = function(userId){
    if (this.players[userId] || this.witnessPlayers[userId]){
        return true;
    }
    return false;
}

room.isHavePlayerInSeat = function(seatIdx){
    var players = this.players;
    for (var uid in players){
        if (players[uid].seatIdx == seatIdx){
            return true;
        }
    }
    return false;
}

room.isDealCard = function(){
    var players = this.players;
    for (var i in players) {
        var player = players[i];
        if ( player.cardInHand.length > 0){
            return true;
        }
    }
    return false;
}

room.isAllReady = function(){
    var players = this.players;
    for (var i in players) {
        var player = players[i];
        if (player.readyStat == 0 || player.cardInHand.length > 0){
            return false;
        }
    }
    return true;
}

room.isInSeat = function(userId){
    if (this.players[userId]){
        return true;
    }
    return false;
}

room.isHaveOneReadyAndNoOneDealCard = function(){
    var readyNum = 0;
    var players = this.players;
    for (var i in players) {
        var player = players[i];
        if (player.cardInHand.length > 0){
            return false;
        }
        if (player.readyStat == 1){
            readyNum++;
        }
    }
    if (readyNum > 0){
        return true;
    }
    return false;
}

room.noReadyPlayer = function(){
    var arr = [];
    for (var uid in this.players){
        if (this.players[uid].readyStat == 0){
            arr.push(uid);
        }
    }
    return arr;
}

room.baseClientRoomData = function(roomData){
    var room = this;
    roomData.roomId = room.roomId;
    roomData.creatorId = room.creatorId;
    roomData.gamePlay = room.gamePlay;
    roomData.roomType = room.roomType;
    roomData.baseCoin = room.baseCoin;
    roomData.rule = {
        maxPersons: room.uplimitPersons,
        GPSActive: room.GPSActive,
        midJoinStat: room.midJoinStat,
        roomLaw: room.roomLaw,
        rulePlay: room.rulePlay
    };
    roomData.witnessPlayers = {};
    var witnessPlayers = room.witnessPlayers;
    for (var uid in witnessPlayers){
        var curPlayer = witnessPlayers[uid];
        roomData.witnessPlayers[uid] = {
            userId: curPlayer.userId,
            userNo: curPlayer.userNo,
            nickname: curPlayer.nickname,
            userIcon: curPlayer.userIcon,
            online: (curPlayer.frontServerId == "") ? 0 : 1
        }
    }
}

room.waitTimeout = function(room){
    console.log(TAG, "等待玩家超时 ！");
}

room.saveRedisCombatGain = function(userId, record){
    var funcArr = playConfig.gamePlayToSetGetCombatGainFunc[this.gamePlay];
    var getCombatGain = funcArr[0];
    var setCombatGain = funcArr[1]
    var _save = function(){
        getCombatGain(userId, function(err, gainArr){
            if (err){
                console.log(TAG, "saveCombatGain 保存战绩redis出错, error: ", err);
                return setTimeout(_save, 3000);
            }
            if (!gainArr){
                gainArr = [];
            }
            var players = [];
            var rePlayers = record.get("players");
            for (var i in rePlayers){
                var player = rePlayers[i];
                players.push({userId: player.userId,
                    userNo: player.userNo,
                    name: player.nickname,
                    coinIncr: player.coinIncr
                });
            }
            var data = {
                roomId: record.get("roomId"),
                roomLaw: record.get("roomLaw"),
                baseCoin: record.get("baseCoin"),
                storeStamp: record.get("endStamp"),
                viewCodeId: record.get("viewCodeId"),
                combatId: record.id.toString(),
                players: players
            };
            gainArr.unshift(data);
            if (gainArr.length > 10){
                gainArr.pop();
            }
            setCombatGain(userId, gainArr);
        });
    }
    _save();
}