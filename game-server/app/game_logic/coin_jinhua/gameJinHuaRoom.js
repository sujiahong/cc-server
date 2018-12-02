"use_strict";
const TAG = "coinJinHuaRoom.js";
const constant = require("../../shared/constant");
const inspect = require("./inspectJin");
const errcode = require("../../shared/errcode");
const baseRoom = require("../base/room");

var preHandCard = {};

function CoinJinHuaRoom() {
    baseRoom.call(this);
    this.firstId = "";//一局从谁开始说话
    this.dealerId = ""; //发牌人Id
    this.winnerSeatIdx = 0;
    this.roundCount = 0;  //当前的回合数从零开始计数
    this.curBetData = {};///当前下注数据
    this.totalCoin = 0;
    this.operateId = "";///操作的玩家id
    this.cardTypeData = {};
    this.compareCardList = [];
}

module.exports = CoinJinHuaRoom;

var temp = function(){};
temp.prototype = baseRoom.prototype;
CoinJinHuaRoom.prototype = new temp();

var room = CoinJinHuaRoom.prototype;

room.init = function (roomId, rule) {
    this.initBase(roomId, rule);
    var len = 53;
    var poker = constant.JIN_POKER;
    for (var k = 1; k < len; ++k){
        this.roomPokerCards.push(poker[k]);
    }
    if (this.roomLaw == constant.JIN_PLAY_TYPE.shunzida){
        var cardTypeData = constant.JIN_CARD_TYPE;
        for (var key in cardTypeData){
            this.cardTypeData[key] = cardTypeData[key];
        }
        this.cardTypeData.shunzi = 3;
        this.cardTypeData.tonghua = 2;
    }else{
        this.cardTypeData = constant.JIN_CARD_TYPE;
    }
}

room.startGame = function(){
    this.lookupDealerId();
    this.stakeBaseCoinAndRoomFee();
    this.startOneRun();
}

room.lookupDealerId = function(){
    var winnerSeatIdx = this.winnerSeatIdx;
    var dealerId = "";
    if (winnerSeatIdx){
        dealerId = getPlayerDealerId(this, winnerSeatIdx);
    }else{
        dealerId = getPlayerDealerId(this, 1);
    }
    if (dealerId == ""){
        return console.log(TAG, "开始接受牌的人Id为空！！");
    }
    this.dealerId = dealerId;
}

var getPlayerDealerId = function(room, curIdx){
    var seatIdxPlayerId = {};
    var players = room.players;
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1 && player.discardStat == 0){
            seatIdxPlayerId[player.seatIdx] = uid;
        }
    }
    //sort(function(a, b){return a.seatIdx - b.seatIdx;});
    return room.getNextSeatPlayerId(seatIdxPlayerId, room.uplimitPersons, curIdx);
}

room.stakeBaseCoinAndRoomFee = function(){
    var baseCoin = this.baseCoin;
    var stakeData = {}
    var players = this.players;
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1){
            var roomFee = Math.ceil(baseCoin * (constant.ROOM_FEE_RATE[baseCoin] || constant.JIN_RATE));
            var data = {before: player.coinNum, roomFee: roomFee};
            player.coinNum -= (baseCoin + roomFee);
            data.after = player.coinNum;
            stakeData[uid] = data;
            player.totalCoin += baseCoin;
            this.totalCoin += baseCoin;
            player.coinArr.push(baseCoin);
        }
    }
    stakeData.dealerId = this.dealerId;
    this.recordPlayerOperation(stakeData);
}

room.preSetCard = function(userId, cards){
    preHandCard[userId] = cards;
}

room.startOneRun = function(){
    this.startStamp = Date.now();
    this.shuffleCard();
    this.dealCard(3);
    ++this.curRunCount;
    this.nextOpPlayerId(this.dealerId);
    this.firstId = this.operateId;
    ++this.roundCount;
}

room.dealCard = function(num) {
    var pokerCards = this.roomPokerCards;
    var pokerCardsLen = pokerCards.length;
    var players = this.players;
    var count = 1;
    for (var i = 0; i < num; ++i){
        for (var uid in players){
            var player = players[uid];
            if (player.readyStat == 1 && player.discardStat == 0){
                var cardInHand = player.cardInHand;
                cardInHand.push(pokerCards[count]);
                ++count;
            }
        }
    }
    for (var uid in preHandCard){////调牌
        if (players[uid]){
            players[uid].cardInHand = preHandCard[uid];
        }
    }
    var handData = {};
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

room.clearRun = function(){
    this.curBetData = {};
    this.operateId = "";///操作的玩家id
    this.roundCount = 0;
    this.firstId = "";
    this.dealerId = "";
    this.totalCoin = 0;
    this.operationDataArr = [];
    this.compareCardList = [];
    var players = this.players;
    for (var uid in players){
        players[uid].clearOneRunPlayer();
    }
}

room.nextOpPlayerId = function(userId){
    this.operateId = this.nextNoDiscardPlayerId(userId);
    this.roundIncrement(); 
}

room.nextNoDiscardPlayerId = function(userId){
    var seatIdxPlayerId = {};
    var players = this.players;
    for (var uid in players){
        var player = players[uid];
        if (player.readyStat == 1 && player.discardStat == 0){
            seatIdxPlayerId[player.seatIdx] = uid;
        }
    }
    var seatIdx = players[userId].seatIdx;
    var maxPersons = this.uplimitPersons;
    var nextUId = this.getNextSeatPlayerId(seatIdxPlayerId, maxPersons, seatIdx % maxPersons + 1);
    if (nextUId == ""){
        return console.log(TAG, "下一个操作的人Id为空！！", nextUId);
    }
    return nextUId;
}

room.roundIncrement = function(){
    if (this.operateId == this.firstId){
        ++this.roundCount;
    }
}

room.roundTimeout = function(room){
    g_ZJHGameMgr.discard(room.roomId, room.operateId, function(err, data){
        console.log(TAG, err, data);
    });
}

room.compareCard = function(player, comparedPlayer){
    var cardTypeData = this.cardTypeData;
    var cards = player.cardInHand;
    var comparedCards = comparedPlayer.cardInHand;
    var typeData = player.handData;
    if (!typeData){
        typeData = inspect.inspectCardType(cards, cardTypeData);
        player.handData = typeData;
    }
    var comparedTypeData = comparedPlayer.handData;
    if (!comparedTypeData){
        comparedTypeData = inspect.inspectCardType(comparedCards, cardTypeData);
        comparedPlayer.handData = comparedTypeData;
    }
    var type = typeData.type;
    var comparedType = comparedTypeData.type;
    var valArr = typeData.valArr;
    var comparedValArr = comparedTypeData.valArr;
    if (this.rulePlay.chibao == 1){
        return inspect.compareNotEat(cardTypeData, type, comparedType, valArr, comparedValArr);
    }else if (this.rulePlay.chibao == 2){
        if (type == cardTypeData.baozi && comparedType == cardTypeData.none && comparedValArr[0] == 2 && comparedValArr[1] == 3 && comparedValArr[2] == 5){
            return -1;
        }else if(comparedType == cardTypeData.baozi && type == cardTypeData.none && valArr[0] == 2 && valArr[1] == 3 && valArr[2] == 5){
            return 1;
        }else{
            return inspect.compareNotEat(cardTypeData, type, comparedType, valArr, comparedValArr);
        }
    }else{
        if (valArr[0] == 14 && valArr[1] == 14 && valArr[2] == 14 && comparedType == cardTypeData.none && comparedValArr[0] == 2 && comparedValArr[1] == 3 && comparedValArr[2] == 5){
            return -1;
        }else if(comparedValArr[0] == 14 && comparedValArr[1] == 14 && comparedValArr[2] == 14 && type == cardTypeData.none && valArr[0] == 2 && valArr[1] == 3 && valArr[2] == 5){
            return 1;
        }else{
            return inspect.compareNotEat(cardTypeData, type, comparedType, valArr, comparedValArr);
        }
    }
}

room.startScore = function(winner) {
    var scoreRet = {};
    this.endStamp = Date.now();
    if (winner) {
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
                };
            }
        }
        var winRet = scoreRet[winnerId];
        winRet.win = 1;
        var winRecordData = {winnerId: winnerId};  
        if (this.rulePlay.xifen == 1){////带喜分
            var cardTypeData = this.cardTypeData;
            var handData = winner.handData;
            if (!handData){
                handData = inspect.inspectCardType(winner.cardInHand, cardTypeData);
            }
            var winnerCardType = handData.type;
            if (winnerCardType == cardTypeData.tonghuashun || winnerCardType == cardTypeData.baozi){
                var rewardCoin = this.baseCoin * constant.JIN_XI_FEN_RATE[winnerCardType];
                winRecordData.rewardCoin = rewardCoin;
                for(var uid in players){
                    var player = players[uid];
                    if (player.readyStat == 1 && player.cardInHand.length > 0){
                        if (player.coinNum < rewardCoin){
                            this.totalCoin += player.coinNum;
                            player.totalCoin += player.coinNum;
                            player.coinNum = 0;
                        }else{
                            player.coinNum -= rewardCoin;
                            this.totalCoin += rewardCoin;
                            player.totalCoin += rewardCoin;
                        }
                        scoreRet[uid].coinNum = player.coinNum;
                    }
                }
            }
        }
        players[winnerId].coinNum += this.totalCoin;
        winRet.coinNum = players[winnerId].coinNum;
        this.recordPlayerOperation(winRecordData);
    }
    return scoreRet;
}

room.getClientRoomData = function(userId){
    var room = this;
    var roomData = {};
    room.baseClientRoomData(roomData);
    roomData.operateId = room.operateId;
    roomData.totalCoin = room.totalCoin;
    roomData.curBetData = room.curBetData;
    roomData.compareCardList = room.compareCardList;
    roomData.dealerId = room.dealerId;
    roomData.roundCount = room.roundCount;
    roomData.players = {};
    var players = room.players;
    for (var uid in players){
        var curPlayer = players[uid];
        var handCards = null;
        if (uid == userId){
            if (curPlayer.seeCardStat == 1){
                handCards = curPlayer.cardInHand;
            }else{
                handCards = [];
                if (curPlayer.cardInHand.length > 0)
                    handCards = [1000, 1000, 1000];
            }
        }else{
            handCards = [];
            if (curPlayer.cardInHand.length > 0)
                handCards = [1000, 1000, 1000];
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
            seeCardStat: curPlayer.seeCardStat,
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
            let player = players[id];
            if (player.readyStat == 1 && player.discardStat == 0) {
                playerHandData[id] = [1000, 1000, 1000];
            }
        }
        var pushData = {dealerId: this.dealerId, operateId: this.operateId};
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
            if (player.readyStat == 1 && player.discardStat == 0){
                playerHandData[id] = [1000, 1000, 1000];
            }
        }
        var pushData = {dealerId: this.dealerId, operateId: this.operateId};
        pushData.playerHandData = playerHandData;
        var clientHandData = {};
        clientHandData.userId = wuid;
        clientHandData.serverId = witnessPlayers[wuid].frontServerId;
        clientHandData.pushData = pushData;
        clientHandDataArr.push(clientHandData);
    }
    return clientHandDataArr;
}