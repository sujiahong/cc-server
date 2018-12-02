"use_strict";
const TAG = "coinNiuRoom.js";
const constant = require("../../shared/constant");
const errcode = require("../../shared/errcode");
const inspect = require("./inspectNiu");
const baseRoom = require("../base/room");

var preHandCard = {};

function CoinNiuRoom(opts) {
    baseRoom.call(this);
    this.bankerId = ""; //庄
    this.autoFlopStat = 0;
}

module.exports = CoinNiuRoom;

var temp = function(){};
temp.prototype = baseRoom.prototype;
CoinNiuRoom.prototype = new temp();

var room = CoinNiuRoom.prototype;

room.init = function (roomId, rule) {
    this.initBase(roomId, rule);
    if (this.roomLaw == constant.NIU_PLAY_TYPE.jingdian){
        var len = 53;
        var poker = constant.NIU_JINGDIAN_CARD;
        for (var k = 1; k < len; ++k){
            this.roomPokerCards.push(poker[k]);
        }
    }else{
        var len = 37;
        var poker = constant.NIU_WUHUA_CARD;
        for (var k = 1; k < len; ++k){
            this.roomPokerCards.push(poker[k]);
        }
    }
}

room.clearRun = function(){
    preHandCard = {};
    this.bankerId = ""; //庄
    var players = this.players;   
    for (var uid in players){
        players[uid].clearOneRunPlayer();
    }
}

room.startGame = function(){
    this.startOneRun();
}

room.startOneRun = function(){
    this.startStamp = Date.now();
    this.shuffleCard();
    this.dealCard(5);
    this.curRunCount++;
}

room.preSetCard = function(userId, cards){
    preHandCard[userId] = cards;
}

room.dealCard = function(num){
    var players = this.players;
    var idx = 1;
    for (var i = 0; i < num; ++i){
        for (var uid in players){
            var player = players[uid];
            var cards = preHandCard[uid];
            if (cards){
                player.cardInHand = cards;
            }
            if (player.cardInHand.length < 5){
                player.cardInHand.push(this.roomPokerCards[idx]);
            }
            ++idx;
        }
    }
}

room.findoutNiuType = function(cards){
    var niuCardsFunc = null;
    if (this.roomLaw == constant.NIU_PLAY_TYPE.jingdian){
        niuCardsFunc = inspect.getJingDianNiuCards;
    }else{
        niuCardsFunc = inspect.getWuHuaNiuCards;
    }
    return niuCardsFunc(cards);
}

///return   {闲家id: {type: "", win: 1, coin: 123, userId: ""}}
room.startScore = function(){
    this.endStamp = Date.now();
    var NIU_MULTI = null;
    if (this.roomLaw == constant.NIU_PLAY_TYPE.jingdian){
        NIU_MULTI = constant.NIU_JINGDIAN_MULTI;
    }else{
        NIU_MULTI = constant.NIU_WUHUA_MULTI;
    }
    var scoreRet = {};
    var baseCoin = this.baseCoin;
    var bankerId = this.bankerId;
    var banker = this.players[bankerId];
    banker.coinNum -= Math.ceil(baseCoin * (constant.ROOM_FEE_RATE[baseCoin] || constant.NIU_RATE));///////扣房费
    var bankerNiu = banker.niuInHand;
    for(var uid in this.players){
        if(uid != bankerId){
            var player = this.players[uid];
            if (player.readyStat == 1 && player.cardInHand.length > 0){
                player.coinNum -= Math.ceil(baseCoin * (constant.ROOM_FEE_RATE[baseCoin] || constant.NIU_RATE));///////扣房费
                var otherNiu = player.niuInHand;
                var ret = inspect.compareCards(bankerNiu, otherNiu);
                var incr = baseCoin * banker.multiple * player.multiple * NIU_MULTI[ret.type]* ret.win;
                console.log("uueue  ", ret, incr);
                ret.coinNum = player.coinNum;
                ret.niuType = otherNiu.type;
                ret.coinIncr = -incr;
                scoreRet[uid] = ret;
            }
        }
    }
    scoreRet[bankerId] = {niuType: bankerNiu.type, coinIncr: 0, coinNum: banker.coinNum};
    this.deductCoinNum(scoreRet);
    return scoreRet;
}

room.deductCoinNum = function(scoreData){
    var bankerPaySum = 0;
    var bankerScoreData = scoreData[this.bankerId];
    for (var uid in scoreData){//拿输的
        if (uid != this.bankerId){
            var data = scoreData[uid];
            if (data.coinIncr < 0){
                var sum = data.coinIncr + data.coinNum;
                if (sum < 0){
                    bankerScoreData.coinIncr += data.coinNum;
                    bankerScoreData.coinNum += data.coinNum;
                    this.players[this.bankerId].coinNum += data.coinNum;
                    data.coinIncr = -data.coinNum;
                    data.coinNum = 0;
                    this.players[uid].coinNum = 0;
                }else{
                    bankerScoreData.coinIncr -= data.coinIncr;
                    bankerScoreData.coinNum -= data.coinIncr;
                    this.players[this.bankerId].coinNum -= data.coinIncr;
                    data.coinNum = sum;
                    this.players[uid].coinNum = sum;
                }
            }else{
                bankerPaySum += data.coinIncr;
            }
        }
    }
    if (bankerPaySum > 0){//给赢的
        if (bankerPaySum > bankerScoreData.coinNum){//庄家不够支付
            for (var uid in scoreData){
                if (uid != this.bankerId){
                    var data = scoreData[uid];
                    if (data.coinIncr > 0){
                        var num = Math.floor(bankerScoreData.coinNum * data.coinIncr/bankerPaySum);
                        bankerScoreData.coinIncr -= num;
                        data.coinNum += num;
                        data.coinIncr = num;
                        this.players[uid].coinNum = data.coinNum;
                    }
                }
            }
            bankerScoreData.coinNum = 0;
            this.players[this.bankerId].coinNum = 0;
        }else{
            for (var uid in scoreData){
                if (uid != this.bankerId){
                    var data = scoreData[uid];
                    if (data.coinIncr > 0){
                        bankerScoreData.coinIncr -= data.coinIncr;
                        bankerScoreData.coinNum -= data.coinIncr;
                        this.players[this.bankerId].coinNum -= data.coinIncr;
                        data.coinNum += data.coinIncr;
                        this.players[uid].coinNum = data.coinNum;
                    }
                }
            }
        }
    }
}

room.getMaxMultiAndEnd = function(){
    var maxMulti = -1;
    var isEnd = true;
    for (var uid in this.players){
        var player = this.players[uid];
        if (player.readyStat == 1){
            var multi = player.multiple;
            if (multi > maxMulti){
                maxMulti = multi;
            }
            if (multi == -1){
                isEnd = false;
            }
        }
    }
    return [maxMulti, isEnd];
}

room.lookupBanker = function(maxMulti){
    var maxMultiUidArr = [];
    for (var uid in this.players){
        var player = this.players[uid];
        if (player.readyStat == 1 && player.multiple == maxMulti){
            maxMultiUidArr.push(uid);
        }
    }
    var ram = Math.floor(Math.random() * 10000000) % maxMultiUidArr.length;
    return maxMultiUidArr[ram];
}

room.isRobMultipleEnd = function(){
    var players = this.players;   
    for (var uid in players) {
        var player = players[uid];
        if (player.readyStat == 1 && player.multiple < 0){
            return false;
        }
    }
    return true;
}

room.isFlopEnd = function(){
    for (var uid in this.players) {
        var player = this.players[uid];
        if (player.readyStat == 1 && player.flopStat == 0){
            return false;
        }
    }
    return true;
}

room.roundTimeout = function(room){
    if (room.bankerId){
        if (room.isRobMultipleEnd()){
            var notFlopArr = getNoFlopPlayerIdArr(room.players);
            for (var i = 0, len = notFlopArr.length; i < len; ++i){
                g_niuGameMgr.flop(room.roomId, notFlopArr[i], (err, data)=>{console.log(TAG, "33333333", err, data)});
            }
        }else{
            var notRobArr = getNoRobMultiplePlayerIdArr(room.players);
            for (var i = 0, len = notRobArr.length; i < len; ++i){
                g_niuGameMgr.robMultiple(room.roomId, notRobArr[i], 1, (err, data)=>{console.log(TAG, "22222222", err, data)});
            }
        }
    }else{
        var notRobArr = getNoRobBankerPlayerIdArr(room.players);
        for (var i = 0, len = notRobArr.length; i < len; ++i){
            g_niuGameMgr.robBanker(room.roomId, notRobArr[i], 0, (err, data)=>{console.log(TAG, "1111111111", err, data)});
        }
    }
}

var getNoRobBankerPlayerIdArr = function(players){
    var arr = [];
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1 && player.multiple == -1){
            arr.push(uid);
        }
    }
    return arr;
}

var getNoRobMultiplePlayerIdArr = function(players){
    var arr = [];
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1 && player.multiple == -1){
            arr.push(uid);
        }
    }
    return arr;
}

var getNoFlopPlayerIdArr = function(players){
    var arr = [];
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1 && player.flopStat == 0){
            arr.push(uid);
        }
    }
    return arr;
}

room.getClientRoomData = function(userId){
    var room = this;
    var roomData = {};
    roomData.roomId = room.roomId;
    roomData.creatorId = room.creatorId;
    roomData.gamePlay = constant.GAME_PLAY.niu_niu;
    roomData.roomType = room.roomType;
    roomData.bankerId = room.bankerId;
    roomData.baseCoin = room.baseCoin;
    roomData.rule = {
        maxPersons: room.uplimitPersons,
        GPSActive: room.GPSActive,
        autoFlopStat: room.autoFlopStat,
        midJoinStat: room.midJoinStat,
        roomLaw: room.roomLaw
    };
    var isRobEnd = room.isRobMultipleEnd();
    roomData.players = {};
    for (var uid in room.players){
        var curPlayer = room.players[uid];
        var handCards;
        var niuData = {};
        if (uid == userId){
            if (curPlayer.flopStat == 0){
                if (isRobEnd){
                    handCards = curPlayer.cardInHand;
                }else{
                    handCards = [];
                    for (var i = 0, len = curPlayer.cardInHand.length-1; i < len; ++i){
                        handCards[i] = curPlayer.cardInHand[i];
                    }
                }
            }else{
                handCards = curPlayer.cardInHand;
                niuData.type = curPlayer.niuInHand.type;
                if (curPlayer.niuInHand.niu){
                    niuData.niu = curPlayer.niuInHand.niu;
                }
                if (curPlayer.niuInHand.aux){
                    niuData.aux = curPlayer.niuInHand.aux;
                }
            }
        }else{
            if (curPlayer.flopStat == 0){
                if (curPlayer.cardInHand.length == 0){
                    handCards = [];
                }else{
                    if (isRobEnd){
                        handCards = [1000, 1000, 1000, 1000, 1000];
                    }else{
                        handCards = [1000, 1000, 1000, 1000];
                    }
                }
            }else{
                handCards = curPlayer.cardInHand;
                niuData.type = curPlayer.niuInHand.type;
                if (curPlayer.niuInHand.niu){
                    niuData.niu = curPlayer.niuInHand.niu;
                }
                if (curPlayer.niuInHand.aux){
                    niuData.aux = curPlayer.niuInHand.aux;
                }
            }
        }
        roomData.players[uid] = {
            userId: curPlayer.userId,
            seatIdx: curPlayer.seatIdx,
            sex: curPlayer.sex,
            location: curPlayer.location,
            userNo: curPlayer.userNo,
            nickname:  curPlayer.nickname,
            loginIp: curPlayer.loginIp,
            userIcon: curPlayer.userIcon,
            clientPlat: curPlayer.clientPlat,
            coinNum: curPlayer.coinNum,
            readyStat: curPlayer.readyStat,
            flopStat: curPlayer.flopStat,
            multiple: curPlayer.multiple,
            cardInHand: handCards,
            niuInHand: niuData,
            online: (curPlayer.frontServerId == "") ? 0 : 1
        }
    }
    roomData.witnessPlayers = {};
    for (var uid in room.witnessPlayers){
        var curPlayer = room.witnessPlayers[uid];
        roomData.witnessPlayers[uid] = {
            userId: curPlayer.userId,
            userNo: curPlayer.userNo,
            nickname: curPlayer.nickname,
            userIcon: curPlayer.userIcon,
            online: (curPlayer.frontServerId == "") ? 0 : 1
        }
    }
    return roomData;
}

room.getAllClientHandData = function(){
    var clientHandDataArr = [];
    var players = this.players;
    for(var uid in players){
        var playerHandData = {};
        for (var id in players) {
            var player = players[id];
            if (player.readyStat == 1) {
                if (uid == id){
                    var handCard = player.cardInHand;
                    playerHandData[id] = [handCard[0], handCard[1], handCard[2], handCard[3]];
                }else{
                    playerHandData[id] = [1000, 1000, 1000, 1000];
                }
            }
        }
        var pushData = {};
        pushData.playerHandData = playerHandData;
        var clientHandData = {};
        clientHandData.userId = uid;
        clientHandData.serverId = players[uid].frontServerId;
        clientHandData.pushData = pushData;
        clientHandDataArr.push(clientHandData);
    }
    var witnessPlayers = this.witnessPlayers;
    for (var wuid in witnessPlayers){
        var playerHandData = {};
        for (var id in players){
            var player = players[id];
            if (player.readyStat == 1){
                playerHandData[id] = [1000, 1000, 1000, 1000];
            }
        }
        var pushData = {};
        pushData.playerHandData = playerHandData;
        var clientHandData = {};
        clientHandData.userId = wuid;
        clientHandData.serverId = witnessPlayers[wuid].frontServerId;
        clientHandData.pushData = pushData;
        clientHandDataArr.push(clientHandData);
    }
    return clientHandDataArr;
}