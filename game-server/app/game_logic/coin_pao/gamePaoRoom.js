"use_strict";
const TAG = "coinPaoRoom.js";
const constant = require("../../shared/constant");
const inspect = require("./inspectPao");
const errcode = require("../../shared/errcode");
const baseRoom = require("../base/room");
const ponderPlay = require("../../AI/ddz/ponderPlay");
const ponderRob = require("../../AI/ddz/ponderRob");
const util = require("../../util/utils");


var preHandCard = {};

function CoinPaoRoom() {
    baseRoom.call(this);
    this.seatIdxPlayerId = null;
    this.multiple = 1;              //倍数/分数,默认是1倍
    this.dealerId = "";
    this.operateId = "";            ///操作的玩家id
    this.curOperateData = null;      //但前出牌数据{userId: "", cards: [], cardType: 7}
    this.totalBombNum = 0;
}

module.exports = CoinPaoRoom;

var temp = function(){};
temp.prototype = baseRoom.prototype;
CoinPaoRoom.prototype = new temp();

var room = CoinPaoRoom.prototype;

room.init = function (roomId, rule) {
    this.initBase(roomId, rule);
}

room.clearRun = function(){
    this.seatIdxPlayerId = null;
    this.multiple = 1;      //倍数/分数,默认是1倍
    this.firstId = "";
    this.operateId = "";
    this.curOperateData = null;  //但前出牌数据{userId: "", seatIdx: 1, cards: [], cardType: 7}
    this.totalBombNum = 0;
    this.operationDataArr = [];
    var players = this.players;
    for(var uid in players){
        players[uid].clearOneRunPlayer();
    }
}

room.startGame = function(){
    var seatIdxPlayerId = {};
    var players = this.players;
    for (var uid in players){
        var player = players[uid];
        seatIdxPlayerId[player.seatIdx] = uid;
    }
    this.seatIdxPlayerId = seatIdxPlayerId;
    var ramSeatIdx = Math.floor(Math.random() * 10000) % this.uplimitPersons + 1;
    this.operateId = seatIdxPlayerId[ramSeatIdx];
    this.startOneRun();
}

room.startOneRun = function(){
    this.startStamp = Date.now();
    this.shuffleCard();
    if (this.rulePlay.budai345 == 1){
        this.dealCard(13);
    }else{
        this.dealCard(17);
    }
    ++this.curRunCount;
}

room.dealCard = function(num) {
    var pokerCards = this.roomPokerCards;
    var pokerCardsLen = pokerCards.length;
    var players = this.players;
    var count = 3;
    for (var i = 0; i < num; ++i){
        for (var uid in players){
            var player = players[uid];
            if (player.readyStat == 1){
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
    //matchingCard(players);
}

room.preSetCard = function(userId, cards){
    preHandCard[userId] = cards;
}

var matchingCard = function(players){
    var seatIdCardsMap = {};
    for (var uid in players){
        var player = players[uid];
        seatIdCardsMap[player.seatIdx] = player.cardInHand;
    }
    var span = 1;
    var seatIdChangeCardsMap = {};
    for (var k = 1; k < 4; ++k){
        seatIdChangeCardsMap[k] = [];
        var valCardArrMap = inspect.getPokerValCardArrMap(seatIdCardsMap[k]);
        var singleValCardArrMap = {};
        var pairValCardArrMap = {};
        var otherValCardArrMap = {};
        for (let i in valCardArrMap){
            var len = valCardArrMap[i].length;
            if (len == 1 && Number(i) < 13){//小于13=K
                singleValCardArrMap[i] = valCardArrMap[i];
            }else if(len == 2 && Number(i) < 13){
                pairValCardArrMap[i] = valCardArrMap[i];
            }else{
                otherValCardArrMap[i] = valCardArrMap[i];
            }
        }
       console.log(singleValCardArrMap, " &&&&&&&&&    ", pairValCardArrMap, "3333333 ", otherValCardArrMap)
        var singleNum = util.objectSize(singleValCardArrMap);
        var pairNum = util.objectSize(pairValCardArrMap);
        if (singleNum >= span){
            var count = 0;
            for (var val in singleValCardArrMap){
                if (count == span){
                    break;
                }
                rmvHandAndAddChangeCards(seatIdCardsMap[k], seatIdChangeCardsMap[k], singleValCardArrMap[val][0]);
                count++;
            }
        }else if (singleNum > 0 && singleNum < span && pairNum > 0){
            var count = 0;
            for (var val in singleValCardArrMap){
                if (count == span){
                    break;
                }
                rmvHandAndAddChangeCards(seatIdCardsMap[k], seatIdChangeCardsMap[k], singleValCardArrMap[val][0]);
                count++;
            }
            if (count < span){
                for (var val in pairValCardArrMap){
                    if (count == span){
                        break;
                    }
                    var arr = pairValCardArrMap[val];
                    for (var i = 0, len = arr.length; i < len; ++i){
                        if (count == span){
                            break;
                        }
                        rmvHandAndAddChangeCards(seatIdCardsMap[k], seatIdChangeCardsMap[k], arr[i]);
                        count++;
                    }
                }
            }
        }else{
            if(pairNum >= span){
                var count = 0;
                for (var val in pairValCardArrMap){
                    if (count == span){
                        break;
                    }
                    var arr = pairValCardArrMap[val];
                    for (var i = 0, len = arr.length; i < len; ++i){
                        if (count == span){
                            break;
                        }
                        rmvHandAndAddChangeCards(seatIdCardsMap[k], seatIdChangeCardsMap[k], arr[i]);
                        count++;
                    }
                }
            }else{
                var count = 0;
                for (var val in otherValCardArrMap){
                    if (count == span){
                        break;
                    }
                    var arr = otherValCardArrMap[val];
                    for (var i = 0, len = arr.length; i < len; ++i){
                        if (count == span){
                            break;
                        }
                        rmvHandAndAddChangeCards(seatIdCardsMap[k], seatIdChangeCardsMap[k], arr[i]);
                        count++;
                    }
                }
            }
        }
    }
    for (var k = 1; k < 4; ++k){
        var appendIdx = (k + span) % 3;
        appendToHandCard(seatIdCardsMap[appendIdx], seatIdChangeCardsMap[k]);
    }
};

var rmvHandAndAddChangeCards = function(cardArr, exchangeArr, cardId){
    for (var i in cardArr){
        if (cardArr[i] == cardId){
            exchangeArr.push(cardId);
            cardArr.splice(i, 1);
            return;
        }
    }
};

var appendToHandCard = function(cardArr, exchangeArr){
    for (var i in exchangeArr){
        cardArr.push(exchangeArr[i]);
    }
};

room.playCard = function(userId, cards){
    var player = this.getPlayerByUId(userId);
    if (cards.length > 0){
        var valArr = inspect.getPokerValueArr(cards);
        var cardType = inspect.getPokerCardType(valArr);
        if (cardType == constant.DDZ_CARD_TYPE.invaild){
            return errcode.CARD_TYPE_ERR;
        }
        if (cardType == constant.DDZ_CARD_TYPE.bomb || 
            cardType == constant.DDZ_CARD_TYPE.kingBomb){
                if (this.totalBombNum < this.rulePlay.bombNum)
                    ++this.totalBombNum;
        }
        if (userId == this.curOperateData.userId){
            player.rmvCardsFromHand(cards);
            player.putCardInDesk(cards);
            this.curOperateData = {userId, cards, cardType, valArr};
            return errcode.OK;
        }else{
            var playData = {userId, cards, cardType, valArr};
            if (inspect.comparePlayCard(playData, this.curOperateData) == 0){
                player.rmvCardsFromHand(cards);
                player.putCardInDesk(cards);
                this.curOperateData = playData;
                return errcode.OK;
            }else{
                return errcode.PRESS_CARD_ERR;
            }
        }
    }else{
        player.putCardInDesk(cards);
        return errcode.OK;
    }
}

room.nextOpPlayerId = function(userId){
    var seatIdx = this.players[userId].seatIdx;
    var maxPersons = this.uplimitPersons;
    var nextUId = this.getNextSeatPlayerId(this.seatIdxPlayerId, maxPersons, seatIdx % maxPersons + 1);
    if (nextUId == ""){
        return console.log(TAG, "下一个操作的人Id为空！！", nextUId);
    }
    this.operateId = nextUId;
}

room.nextRobPlayerId = function(userId){
    var seatIdxPlayerId = {};
    var players = this.players;
    for (var uid in players){
        var player = players[uid];
        if (player.robScore < 0){
            seatIdxPlayerId[player.seatIdx] = uid;
        }
    }
    var seatIdx = players[userId].seatIdx;
    var maxPersons = this.uplimitPersons;
    var nextUId = this.getNextSeatPlayerId(seatIdxPlayerId, maxPersons, seatIdx % maxPersons + 1);
    if (nextUId == ""){
        return console.log(TAG, "下一个操作的人Id为空！！", nextUId);
    }
    this.operateId = nextUId;
}

room.startScore = function(winner) {
    var scoreRet = {};
    this.endStamp = Date.now();
    if (winner) {
        var baseCoin = this.baseCoin;
        var players = this.players;
        var winnerId = winner.userId;
        var dealerId = this.dealerId;
        var isSpring = isRunSpring(players, winnerId, dealerId);
        if (isSpring){
            this.multiple += this.multiple;
        }
        var coinIncr = baseCoin * this.multiple * Math.pow(2, this.totalBombNum);
        var totalCoin = coinIncr + coinIncr;
        var realTotalCoin = 0;
        for(var uid in players){
            var player = players[uid];
            scoreRet[uid] = {
                win: -1,
                coinNum: 0,
                cards: player.cardInHand,
            };
            player.coinNum -= Math.ceil(baseCoin * (constant.ROOM_FEE_RATE[baseCoin] || constant.DDZ_RATE));
            if (winnerId == uid) {
                scoreRet[uid].win = 1;
            }else{
                if (uid == dealerId) {
                    if (player.coinNum < totalCoin){
                        player.coinIncr = -player.coinNum;
                        player.coinNum = 0;
                    }else{
                        player.coinIncr = -totalCoin;
                        player.coinNum -= totalCoin;
                    }
                    realTotalCoin = -player.coinIncr;
                } else {
                    if (dealerId == winnerId) {
                        if (player.coinNum < coinIncr){
                            player.coinIncr = -player.coinNum;
                            player.coinNum = 0;
                        }else{
                            player.coinIncr = -coinIncr;
                            player.coinNum -= coinIncr;
                        }
                        realTotalCoin += -player.coinIncr;
                    }else{
                        scoreRet[uid].win = 1;
                    }
                }
                scoreRet[uid].coinNum = player.coinNum;
            }
        }
        console.log(realTotalCoin)
        for(var uid in scoreRet){
            var player = players[uid];
            var ret = scoreRet[uid];
            if (ret.win == 1){
                if (uid == dealerId){
                    player.coinIncr = realTotalCoin;
                    player.coinNum += realTotalCoin;
                }else{
                    var realIncr = Math.floor(realTotalCoin/2);
                    player.coinIncr = realIncr;
                    player.coinNum += realIncr;
                }
                scoreRet[uid].coinNum = player.coinNum;
            }
        }
        var winRecordData = {winnerId: winnerId, isSpring: isSpring};
        this.recordPlayerOperation(winRecordData);
    }
    return scoreRet;
}

var isRunSpring = function(players, winnerId, dealerId){
    if (winnerId == dealerId){///地主赢
        for (var uid in players){
            if (uid != dealerId){
                var isSpringed = isFarmerSpringed(players[uid].cardInDesk);
                if (!isSpringed){
                    return isSpringed;
                }
            }
        }
        return true;
    }else{
        return isDealerSpringed(players[dealerId].cardInDesk);
    }
}

var isFarmerSpringed = function (cardInDesk) {
	for (var i = 0, len = cardInDesk.length; i < len; ++i) {
		if (cardInDesk[i].length > 0) {
			return false;
		}
	}
	return true;
}

var isDealerSpringed = function (cardInDesk) {
	for (var i = 1, len = cardInDesk.length; i < len; ++i) {
		if (cardInDesk[i].length > 0) {
			return false;
		}
	}
	return true;
}

room.roundTimeout = function(room){
    var operateId = room.operateId;
    var roomId = room.roomId;
    if (!operateId){
        return console.log(TAG, "000000000操作人错误 ", operateId);
    }
    var player = room.getPlayerByUId(operateId);
    if (player.trusteeStat == 0){
        g_ddzGameMgr.comeinTrustee(roomId, operateId, ()=>{
            if (operateId == room.curOperateData.userId){
                var cards = ponderPlay.getLevelOneThinkCards(room, operateId);
                g_ddzGameMgr.playCard(roomId, operateId, cards, (err, data)=>{console.log("1111111111", err, data)});
            }else{
                g_ddzGameMgr.playCard(roomId, operateId, [], (err, data)=>{console.log("33333333333", err, data)});
            }
        });
    }else{///已经托管了
        if (operateId == room.curOperateData.userId){
            var cards = ponderPlay.getLevelOneThinkCards(room, operateId);
            g_ddzGameMgr.playCard(roomId, operateId, cards, (err, data)=>{console.log("1111111111", err, data)});
        }else{
            g_ddzGameMgr.playCard(roomId, operateId, [], (err, data)=>{console.log("33333333333", err, data)});
        }
    }
}

room.getClientRoomData = function(userId){
    var room = this;
    var roomData = {};
    room.baseClientRoomData(roomData);
    roomData.operateId = room.operateId;
    roomData.dealerId = room.dealerId;
    roomData.landlordCards = room.auxiliaryCards;
    roomData.multiple = room.multiple;
    roomData.curOperateData = room.curOperateData;
    roomData.totalBombNum = room.totalBombNum;
    roomData.players = {};
    var players = room.players;
    for (var uid in players){
        var curPlayer = players[uid];
        var handCards = null;
        if (uid == userId){
            handCards = curPlayer.cardInHand;
        }else{
            handCards = curPlayer.cardInHand.length;
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
            trusteeStat: curPlayer.trusteeStat,
            robScore: curPlayer.robScore,
            cardInHand: handCards,
            cardInDesk: curPlayer.cardInDesk,
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
                    playerHandData[id] = player.cardInHand;
                }else{
                    playerHandData[id] = player.cardInHand.length;
                }
            }
        }
        var pushData = {operateId: this.operateId, landlordCards: this.auxiliaryCards};
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
                playerHandData[id] = player.cardInHand.length;
            }
        }
        var pushData = {operateId: this.operateId, landlordCards: this.auxiliaryCards};
        pushData.playerHandData = playerHandData;
        var clientHandData = {};
        clientHandData.userId = wuid;
        clientHandData.serverId = witnessPlayers[wuid].frontServerId;
        clientHandData.pushData = pushData;
        clientHandDataArr.push(clientHandData);
    }
    return clientHandDataArr;
}