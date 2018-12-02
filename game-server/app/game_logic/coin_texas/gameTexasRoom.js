"use_strict";
const TAG = "coinKengRoom.js";
const utils = require('../../util/utils');
const constant = require("../../shared/constant");
const errcode = require("../../shared/errcode");
const inspect = require("./inspectKeng");
const baseRoom = require("../base/room");

var preHandCard = {};

function CoinKengRoom() {
    baseRoom.call(this);
    this.dealCardIdx = 0;
    this.operateId = "";///操作的玩家id
    this.totalCoin = 0;
    this.maxBetCoin = 0;///最大下注金币
    this.winnerSeatIdx = 0;///////赢者座位号
    this.gongzhang = 0;
    this.gongzhangUIdArr = [];
    this.firstIdArr = [];
    this.startIdArr = [];
    this.betCoinStat = 0;  ///1 下注  2 加注
    this.appendBetCoinId = "";////加注者Id
    this.appendIdArr = [];///////加注者Id数组
    this.noWinnerStat = 0;   /// 1 烂锅局
}

module.exports = CoinKengRoom;

var temp = function(){};
temp.prototype = baseRoom.prototype;
CoinKengRoom.prototype = new temp();

var room = CoinKengRoom.prototype;

room.init = function (roomId, rule) {
    this.initBase(roomId, rule);
    if (this.roomLaw == constant.KENG_PLAY_TYPE.ban_keng_10){
        var len = 20;
        var daiwang = this.rulePlay.daiwang;
        if (daiwang == 1 || daiwang == 2){
            len = 22;
        }
        for (var k = 1; k < len; ++k){
            this.roomPokerCards.push(constant.BANKENG10_CARD[k]);
        }
        if (daiwang == 1){
            this.roomPokerCards.push(constant.BANKENG10_CARD[len] - 2);
        }else{
            this.roomPokerCards.push(constant.BANKENG10_CARD[len]);
        }
    }else if (this.roomLaw == constant.KENG_PLAY_TYPE.ban_keng_9){
        var len = 24;
        var daiwang = this.rulePlay.daiwang;
        if (daiwang == 1 || daiwang == 2){
            len = 26;
        }
        for (var k = 1; k < len; ++k){
            this.roomPokerCards.push(constant.BANKENG9_CARD[k]);
        }
        if (daiwang == 1){
            this.roomPokerCards.push(constant.BANKENG9_CARD[len] - 2);
        }else{
            this.roomPokerCards.push(constant.BANKENG9_CARD[len]);
        }
    }else{
        for (var k = 1; k < 53; ++k){
            this.roomPokerCards.push(constant.QUANKENG_CARD[k]);
        }
    }
}

room.startGame = function(){
    this.lookupFirstId();
    this.stakeBaseCoinAndRoomFee();
    this.startOneRun();
    this.lookupStartId();
}

room.stakeBaseCoinAndRoomFee = function(){
    var baseCoin = this.baseCoin;
    this.maxBetCoin = baseCoin;
    var stakeData = {}
    var players = this.players;
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1){
            var roomFee = Math.ceil(baseCoin * (constant.ROOM_FEE_RATE[baseCoin] || constant.KENG_RATE));
            var data = {before: player.coinNum, roomFee: roomFee};
            player.coinNum -= (baseCoin + roomFee);
            data.after = player.coinNum;
            stakeData[uid] = data;
            player.totalCoin += baseCoin;
            this.totalCoin += baseCoin;
        }
    }
    stakeData.firstId = this.getFirstId();
    this.recordPlayerOperation(stakeData);
}

room.lookupFirstId = function(){
    var startIdArr = this.startIdArr;
    var len = startIdArr.length;
    if (len > 0){
        this.firstIdArr.push(startIdArr[len - 1]);
    }else{
        var winnerSeatIdx = this.winnerSeatIdx;
        var firstId = "";
        if (winnerSeatIdx){
            firstId = getPlayerFirstId(this, winnerSeatIdx);
        }else{
            firstId = getPlayerFirstId(this, 1);
        }
        if (firstId == ""){
            return console.log(TAG, "开始接受牌的人Id为空！！");
        }
        this.firstIdArr.push(firstId);
    }
}

var getPlayerFirstId = function(room, curIdx){
    var seatIdxPlayerId = {};
    var players = room.players;
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1 && player.discardStat == 0){
            seatIdxPlayerId[player.seatIdx] = uid;
        }
    }
    //sort(function(a, b){return a.seatIdx - b.seatIdx;});
    return room.getNextSeatPlayerId(seatIdxPlayerId, 5, curIdx);
}

room.getFirstId = function(){
    var len = this.firstIdArr.length;
    if (len > 0){
        return this.firstIdArr[len-1];
    }
    return "";
}

room.getBankerId = function(){
    var len = this.firstIdArr.length;
    if (len > 0){
        return this.firstIdArr[0];
    }
    return "";
}

room.startOneRun = function(){
    this.startStamp = Date.now();
    this.shuffleCard();
    this.dealCard(3);
    this.curRunCount++;
}

room.startNoWinnerRun = function(){
    this.shuffleCard();
    this.dealCard(3);
}

room.preSetCard = function(userId, cards){
    preHandCard[userId] = cards;
}

room.dealCard = function(num){
    var pokerCards = this.roomPokerCards;
    var pokerCardsLen = pokerCards.length;
    var players = this.players;
    for (var i = 0; i < num; ++i){
        for (var uid in players){
            var player = players[uid];
            if (player.readyStat == 1 && player.discardStat == 0){
                var cardInHand = player.cardInHand;
                if (this.dealCardIdx < pokerCardsLen){
                    cardInHand.push(pokerCards[this.dealCardIdx]);
                }else{
                    this.gongzhang = pokerCards[pokerCardsLen-1];
                    cardInHand.push(this.gongzhang);
                    this.gongzhangUIdArr.push(uid);
                }
                ++this.dealCardIdx;
            }
        }
    }
    for (var uid in preHandCard){////调牌
        if (players[uid]){
            players[uid].cardInHand = preHandCard[uid];
        }
    }
    var handData = {};
    handData.gongzhang = this.gongzhang;
    handData.gongzhangUIdArr = [];
    for (var i = 0, len = this.gongzhangUIdArr.length; i < len; ++i){
        handData.gongzhangUIdArr[i] = this.gongzhangUIdArr[i];
    }
    for (var uid in players){
        var player = players[uid];
        var arr = [];
        var hand = player.cardInHand;
        for (var i = 0, len = hand.length; i < len; ++i){
            arr[i] = hand[i];
        }
        handData[uid] = arr;
    }
    this.recordPlayerOperation(handData);
}

room.lookupStartId = function(){
    var max = -1;
    var players = this.players;
    var seatIdxPlayerId = null;
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1 && player.discardStat == 0){
            var cardInHand = player.cardInHand;
            var cardId = cardInHand[cardInHand.length - 1];
            var val = cardId % 100;
            if (val > max){
                max = val;
                seatIdxPlayerId = {};
                seatIdxPlayerId[player.seatIdx] = uid;
            }else if (val == max){
                seatIdxPlayerId[player.seatIdx] = uid;
            }
        }
    }
    this.betCoinStat = 1;///修改为下注状态
    if (utils.objectSize(seatIdxPlayerId) > 1){//最先发牌的
        var firstId = this.getFirstId();
        var firstSeatIdx = players[firstId].seatIdx;
        var startId = this.getNextSeatPlayerId(seatIdxPlayerId, 5, firstSeatIdx);
        if (startId == ""){
            return console.log(TAG, "开始说话的人Id为空！！");
        }
        this.startIdArr.push(startId);
        this.operateId = startId;
    }else{
        for (var seatIdx in seatIdxPlayerId){
            this.operateId = seatIdxPlayerId[seatIdx];
            return this.startIdArr.push(seatIdxPlayerId[seatIdx]);
        }
    }
}

room.getStartId = function(){
    var len = this.startIdArr.length;
    if (len > 0){
        return this.startIdArr[len-1];
    }
    return "";
}

room.removeStartId = function(){
    var len = this.startIdArr.length;
    if (len > 0){
        this.startIdArr.pop();
    }
}

room.nextOpPlayerId = function(userId){
    var seatIdxPlayerId = {};
    var players = this.players;
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1 && player.discardStat == 0){
            seatIdxPlayerId[player.seatIdx] = uid;
        }
    }
    var seatIdx = players[userId].seatIdx;
    var nextUId = this.getNextSeatPlayerId(seatIdxPlayerId, 5, seatIdx% 5 + 1);
    if (nextUId == ""){
        return console.log(TAG, "下一个操作的人Id为空！！", nextUId);
    }
    this.operateId = nextUId;
}

room.nextAppendPlayerId = function(userId){
    var seatIdxPlayerId = {};
    var players = this.players;
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1){
            if (player.discardStat == 0){
                seatIdxPlayerId[player.seatIdx] = uid;
            }else if (player.discardStat == 1 && uid == this.getStartId()){
                seatIdxPlayerId[player.seatIdx] = uid;
            }
        }
    }
    var seatIdx = players[userId].seatIdx;
    var nextUId = this.getNextSeatPlayerId(seatIdxPlayerId, 5, seatIdx% 5 + 1);
    if (nextUId == ""){
        return console.log(TAG, "下一个加注的人Id为空！！", nextUId);
    }
    this.appendBetCoinId = nextUId;
    this.operateId = nextUId;
}

room.getRoundCount = function(){
    return this.firstIdArr.length;
}

room.isRunEnd = function(){
    console.log(this.firstIdArr, this.startIdArr)
    if (this.getRoundCount() > 2){
        return true;
    }else if (this.getRoundCount() > 1 && this.roomPokerCards.length <= this.dealCardIdx){
        return true;
    }
    return false;
}

room.startScore = function(winner){
    var scoreRet = {};
    this.endStamp = Date.now();
    if (winner){
        this.winnerSeatIdx = winner.seatIdx;
        var winnerId = winner.userId;
        var players = this.players;
        for(var uid in players){
            var player = players[uid];
            if (player.readyStat == 1 && player.cardInHand.length > 0){
                scoreRet[uid] = {
                    win: -1,
                    coinNum: player.coinNum,
                    cards: player.cardInHand,
                    score: 0,
                };
            }
        }
        this.noWinnerStat = 0;     ////清除烂锅局
        var winRet = scoreRet[winnerId];
        winRet.win = 1;
        players[winnerId].coinNum += this.totalCoin;
        winRet.coinNum = players[winnerId].coinNum;  
        winRet.score = inspect.computeScore(this, winner.userId, winner.cardInHand);
        this.recordPlayerOperation({winnerId: winnerId, languoState: 0});
    }else{
        var max = -1;
        var seatIdxPlayerId = null;
        var players = this.players;
        for(var uid in players){
            var player = players[uid];
            if (player.readyStat == 1 && player.cardInHand.length > 0){
                if (player.discardStat == 0){
                    var score = inspect.computeScore(this, uid, player.cardInHand);
                    if (score > max){
                        max = score;
                        seatIdxPlayerId = {};
                        seatIdxPlayerId[player.seatIdx] = uid;
                    }else if (score == max){
                        seatIdxPlayerId[player.seatIdx] = uid;
                    }
                    scoreRet[uid] = {
                        win: -1,
                        coinNum: player.coinNum,
                        cards: player.cardInHand,
                        score: score,
                    };
                }else{
                    scoreRet[uid] = {
                        win: -1,
                        coinNum: player.coinNum,
                        cards: player.cardInHand,
                        score: 0,
                    };
                }
            }
        }
        if (utils.objectSize(seatIdxPlayerId) > 1){//最先说话的
            var startId = this.getStartId();
            var startSeatIdx = players[startId].seatIdx;
            var winnerId = this.getNextSeatPlayerId(seatIdxPlayerId, 5, startSeatIdx);
            if (winnerId == ""){
                return console.log(TAG, "赢钱的人Id为空！！", winnerId);
            }
            this.winnerSeatIdx = players[winnerId].seatIdx;
            if (this.rulePlay.languobei == 0){
                var winRet = scoreRet[winnerId];
                winRet.win = 1;
                players[winnerId].coinNum += this.totalCoin;
                winRet.coinNum = players[winnerId].coinNum; 
                this.recordPlayerOperation({winnerId: winnerId, languoState: 0});
            }else{
                this.noWinnerStat++;  ////设置为烂锅局
                this.recordPlayerOperation({winnerId: "", languoState: 1});
            }
        }else{
            this.noWinnerStat = 0;     ////清除烂锅局
            for (var seatIdx in seatIdxPlayerId){
                this.winnerSeatIdx = seatIdx;///////赢者座位号
                var winnerId = seatIdxPlayerId[seatIdx];
                scoreRet[winnerId].win = 1;
                players[winnerId].coinNum += this.totalCoin;
                scoreRet[winnerId].coinNum = players[winnerId].coinNum; 
                this.recordPlayerOperation({winnerId: winnerId, languoState: 0});
            }
        }
    }
    return scoreRet;
}

room.clearRound = function(){
    this.betCoinStat = 0;
    this.appendBetCoinId = "";
    this.appendIdArr = [];
    this.operateId = "";
    var players = this.players;
    for (var uid in players){
        var player = players[uid];
        player.betCoin = -1;
        player.roundCoin = 0;
    }
}

room.clearPlayerBetCoin = function(){
    var players = this.players;
    for (var uid in players){
        var player = players[uid];
        player.betCoin = -1;
    }
}

room.clearNoWinRun = function(){
    this.dealCardIdx = 0;
    this.betCoinStat = 0;
    this.appendBetCoinId = "";
    this.appendIdArr = [];
    this.operateId = "";
    this.gongzhang = 0;
    this.gongzhangUIdArr = [];
    this.firstIdArr = [];
    this.startIdArr = [];
    this.maxBetCoin = 0;
    var players = this.players;
    for (var uid in players){
        var player = players[uid];
        player.betCoin = -1;
        player.roundCoin = 0;
        player.discardStat = 0;
        player.cardInHand = [];
    }
}

room.clearRun= function(){
    preHandCard = {};
    this.dealCardIdx = 0;
    this.totalCoin = 0;
    this.maxBetCoin = 0;
    this.gongzhang = 0;
    this.gongzhangUIdArr = [];
    this.firstIdArr = [];
    this.startIdArr = [];
    this.betCoinStat = 0;  ///1 下注  2 加注
    this.appendBetCoinId = "";////加注者Id
    this.appendIdArr = [];
    this.operateId = "";///操作的玩家id
    this.noWinnerStat = 0;
    this.operationDataArr = [];
    var players = this.players;    
    for (var uid in players){
        players[uid].clearOneRunPlayer();
    }
}

room.roundTimeout = function(room){
    if (room.betCoinStat == 1){
        g_kengGameMgr.discard(room.roomId, room.operateId, function(err, data){
            console.log("11111", err, data);
            if (data.code == errcode.ZHUA_A_BI_PAO){
                g_kengGameMgr.betCoin(room.roomId, room.operateId, {coin: room.baseCoin*5*(room.noWinnerStat+1), operation: 5}, function(err, data){
                    console.log("2222", err, data);
                });
            }
        });
    }else if(room.betCoinStat == 2){
        if (room.operateId == room.appendBetCoinId){
            g_kengGameMgr.betCoin(room.roomId, room.operateId, {coin: 0, operation: 1}, function(err, data){
                console.log(err, data);
            });
        }else{
            g_kengGameMgr.discard(room.roomId, room.operateId, function(err, data){
                console.log(err, data);
            });
        }
    }else{
        console.log("没有意义的押注状态！！  betCoinStat:", room.betCoinStat);
    }
}

room.isHaveGongzhang = function(userId){
    var arr = this.gongzhangUIdArr;
    for (var i = 0, len = arr.length; i < len; ++i){
        if (arr[i] == userId){
            return true;
        }
    }
    return false;
}

room.getClientRoomData = function(userId){
    var room = this;
    var roomData = {};
    room.baseClientRoomData(roomData);
    roomData.operateId = room.operateId;
    roomData.totalCoin = room.totalCoin;
    roomData.maxBetCoin = room.maxBetCoin;
    roomData.gongzhang = room.gongzhang;
    roomData.gongzhangUIdArr = room.gongzhangUIdArr;
    roomData.firstId = room.getBankerId();
    roomData.startId = room.getStartId();
    roomData.roundCount = room.getRoundCount();
    roomData.betCoinState = room.betCoinStat;  ///1 下注  2 加注
    roomData.appendBetCoinId = room.appendBetCoinId;
    roomData.languoState = room.noWinnerStat ? 1 : 0;
    var len = room.appendIdArr.length;
    if (len > 0){
        roomData.firstAppendId = room.appendIdArr[0];
    }else{
        roomData.firstAppendId = "";
    }
    roomData.players = {};
    var players = room.players;
    for (var uid in players){
        var curPlayer = players[uid];
        var handCards = null;
        if (uid == userId){
            handCards = curPlayer.cardInHand;
        }else{
            handCards = [];
            var cardInHand = curPlayer.cardInHand;
            for (var i = 0,len = cardInHand.length; i < len; ++i){
                if (i > 1){
                    handCards.push(cardInHand[i]);
                }else{
                    handCards.push(1000);
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
            discardStat: curPlayer.discardStat,
            roundCoin: curPlayer.roundCoin,
            totalCoin: curPlayer.totalCoin,
            betCoinData: curPlayer.betCoinData,
            cardInHand: handCards,
            online: (curPlayer.frontServerId == "") ? 0 : 1
        }
        roomData.players[uid].betCoinData.coinArr = curPlayer.coinArr;
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
                var handCard = player.cardInHand;
                if (uid == id){
                    playerHandData[id] = handCard;
                }else{
                    playerHandData[id] = [1000, 1000, handCard[2]];
                }
            }
        }
        var pushData = { firstId: this.getFirstId(), startId: this.getStartId(), totalCoin: this.totalCoin};
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
                playerHandData[id] = [1000, 1000, player.cardInHand[2]];
            }
        }
        var pushData = { firstId: this.getFirstId(), startId: this.getStartId(), totalCoin: this.totalCoin};
        pushData.playerHandData = playerHandData;
        var clientHandData = {};
        clientHandData.userId = wuid;
        clientHandData.serverId = witnessPlayers[wuid].frontServerId;
        clientHandData.pushData = pushData;
        clientHandDataArr.push(clientHandData);
    }
    return clientHandDataArr;
}