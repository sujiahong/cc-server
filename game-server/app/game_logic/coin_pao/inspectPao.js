///////在手里的牌和打出去的牌
"use strict"
const TAG = "inspectPao.js";
const utils = require('../../util/utils');
const constant = require("../../shared/constant");
const errcode = require("../../shared/errcode");
const pokerCardType = constant.DDZ_CARD_TYPE;
var exp = module.exports;

exp.comparePlayCard = function(playData, curData){
    if (playData && curData){
        if (curData.cardType == pokerCardType.kingBomb){
            return 2;
        }else if (curData.cardType == pokerCardType.bomb){
            if (playData.cardType == pokerCardType.kingBomb){
                return 0;
            }else if (playData.cardType == pokerCardType.bomb){
                return comparePokerValue(playData.valArr, curData.valArr, pokerCardType.bomb);
            }else{
                return 2;
            }
        }else{
            if (playData.cardType == pokerCardType.kingBomb || playData.cardType == pokerCardType.bomb){
                return 0;
            }else{
                if (curData.cardType == playData.cardType){
                    return comparePokerValue(playData.valArr, curData.valArr, curData.cardType);
                }else{
                    return 2;
                }
            }
        }
    }
    return 1;
}

var comparePokerValue = function(playCards, curCards, cardType){
    if (playCards.length > 0 && curCards.length > 0){
        if (pokerCardTypeCompareHandler[cardType](playCards, curCards)){
            return 0;
        }
        return 2;
    }
}

var pokerCardTypeCompareHandler = {
    [pokerCardType.singleCard]: function(tCard, tCur){
        var val1 = tCard[0];
        var val2 = tCur[0];
        return val1 > val2;
    },
    [pokerCardType.pairCard]: function(tCard, tCur){
        var val1 = tCard[0];
        var val2 = tCur[0];
        return val1 > val2;
    },
    [pokerCardType.threeCard]: function(tCard, tCur){
        var val1 = tCard[0];
        var val2 = tCur[0];
        return val1 > val2;
    },
    [pokerCardType.consecutivePair]: function(tCard, tCur){
        return compareWithShunzi.call(this, tCard, tCur, 2);
    },
    [pokerCardType.threeSequence]: function(tCard, tCur){
        return compareWithShunzi.call(this, tCard, tCur, 3);
    },
    [pokerCardType.singleSequence]: function(tCard, tCur){
        return compareWithShunzi.call(this, tCard, tCur, 1);
    },
    [pokerCardType.aircraftWithWings]: function(tCard, tCur){
        return compareWithShunzi.call(this, tCard, tCur, 3);
    },
    [pokerCardType.threeWithPair]: function(tCard, tCur){
        var val1 = getCardValByNum(tCard, 3);
        var val2 = getCardValByNum(tCur, 3);
        return val1 > val2;
    },
    [pokerCardType.threeWithOne]: function(tCard, tCur){
        var val1 = getCardValByNum(tCard, 3);
        var val2 = getCardValByNum(tCur, 3);
        return val1 > val2;
    },
    [pokerCardType.fourWithPair]: function(tCard, tCur){
        var val1 = getCardValByNum(tCard, 4);
        var val2 = getCardValByNum(tCur, 4);
        return val1 > val2;
    },
    [pokerCardType.bomb]: function(tCard, tCur){
        if (tCard.length > tCur.length){
            return true;
        }else if (tCard.length < tCur.length){
            return false;
        }else{
            var val1 = tCard[0];
            var val2 = tCur[0];
            return val1 > val2;
        }
    }
}

var compareWithShunzi = function(tValArr, tCurValArr, num){
    if (tValArr.length == tCurValArr.length){
        var cardSeqTab = getAppointSequence(tValArr, num);
        var curSeqTab = getAppointSequence(tCurValArr, num);
        var val1 = getMaxPokerVal(cardSeqTab);
        var val2 = getMaxPokerVal(curSeqTab);
        return val1 > val2;
    }else{
        return false;
    }
}

var getAppointSequence = function(valArr, num){
    if (valArr.length > 0){
        var valKeyTab = getPokerValNumMap(valArr);
        var tempTab = [];
        for (var k in valKeyTab){
            if (valKeyTab[k] >= num){
                tempTab.push(Number(k));
            }
        }
        return tempTab;
    }
    return [];
}

var getMaxPokerVal = function(tValCard){
    if (tValCard.length > 0){
        var maxVal = 0;
        for (var k in tValCard) {
            if (tValCard[k] > maxVal) {
                maxVal = tValCard[k];
            }
        }
        return maxVal;
    }
}

var getCardValByNum = function(valArr, num){
    if (valArr.length > 0){
        var keyArr = [];
        var valKeyTab = getPokerValNumMap(valArr);
        for (var k in valKeyTab){
            if (valKeyTab[k] == num){
                keyArr.push(Number(k));
            }
        }
        if (keyArr.length > 0){
            return keyArr[keyArr.length-1];
        }
    }
    return 0;
}


///////////////////////////计算牌型////////////////////////////////////////
exp.getPokerValueArr = function(tCard){
    if (tCard && typeof(tCard) == "object") {
        var tempTab = [];
        for (var k in tCard) {
            var val = Number(tCard[k]) % 100;
            tempTab.push(val);
        }
        return tempTab;
    }
    return [];
};

exp.getPokerCardType = function(valArr){
    if (valArr && typeof(valArr) == "object") {
        var valNumMap = getPokerValNumMap(valArr);
        var len = valArr.length;
        if (len == 1){
            if (exp.isSingleCard(valArr)){
                return pokerCardType.singleCard;
            }
        }else if (len == 2){
            if (exp.isOnePokerValue(valNumMap)){
                return pokerCardType.pairCard;
            }else if (exp.isKingBomb(valArr)){
                return pokerCardType.kingBomb;
            }
        }else if (len == 3){
            if (exp.isOnePokerValue(valNumMap)){
                return pokerCardType.threeCard;
            }
        }else if (len == 4){
            if (exp.isThreeWithSomething(valNumMap)){
                return pokerCardType.threeWithOne;
            }else if (exp.isOnePokerValue(valNumMap)){
                return pokerCardType.bomb;
            }
        }else if (len == 5){
            if (exp.isThreeWithSomething(valNumMap)){
                return pokerCardType.threeWithPair;
            }else if (exp.isSingleSequence(valNumMap)){ 
                return pokerCardType.singleSequence;
            }
        }else{
            if (exp.isConsecutivePair(valNumMap, len)){
                return pokerCardType.consecutivePair;
            }else if (exp.isSingleSequence(valNumMap)){ 
                return pokerCardType.singleSequence;
            }else if (exp.isThreeSequence(valNumMap, len)){
                return pokerCardType.threeSequence;
            }else if (exp.isAircraftWithWings(valNumMap, len)){
                return pokerCardType.aircraftWithWings;
            }else if (exp.isFourWithTwo(valNumMap, len)){
                return pokerCardType.fourWithPair;
            }else{
              return pokerCardType.invaild;
            }
        }
    }
    return pokerCardType.invaild;
};

/////////////////各种牌型验证////////////////
exp.getPokerSuit = function(cardKeyId){
    if(cardKeyId){
        return Number(cardKeyId) / 100;
    }
    return 0;
};

exp.getPokerValue = function(cardKeyId){
    if(cardKeyId){
        return Number(cardKeyId) % 100;
    }
    return 0; 
};

exp.isSingleCard = function(){
    return true;
};

exp.isOnePokerValue = function(valNumMap){
    if(isEqualValueInCardTab(valNumMap, 1)){
        return true;
    }
    return false;
};

exp.isConsecutivePair = function(valNumMap, len){
    if(len >= 6 && len % 2 == 0){
        if(isContinuousValueInCardTab(valNumMap, 2, 3)){
            return true;
        }
    }
    return false;
};

exp.isThreeSequence = function(valNumMap, len){
    if(len >= 6 && len % 3 == 0){
        if(isHaveOnlyThree(valNumMap)){
            if(isContinuousValueInCardTab(valNumMap, 3, 2)){
                return true;
            }
        }
    }
    return false;
};

var isHaveOnlyThree = function(valNumMap){
    for (var k in valNumMap){
        if (valNumMap[k] != 3){
            return false;
        }
    }
    return true;
}

exp.isSingleSequence = function(valNumMap){
    if(isContinuousValueInCardTab(valNumMap, 1, 5)){
        return true;
    }
    return false;
};

exp.isFourWithTwo = function(valNumMap, len){
    if(len == 6 || len == 8){
        if (utils.objectSize(valNumMap) == 3){
            if((isHaveFixNum(valNumMap, 4) && !isHaveFixNum(valNumMap, 3))){
                return true;
            }
        }
    }
    return false;
};

exp.isThreeWithSomething = function(valNumMap){
    if (isHaveFixNum(valNumMap, 3)){
        if(isEqualValueInCardTab(valNumMap, 2)){
            return true;
        }
    }
    return false;
};

var isHaveFixNum = function(valNumMap, num){
    for (var k in valNumMap){
        if (valNumMap[k] == num){
            return true;
        }
    }
    return false;
};

exp.isAircraftWithWings = function(valNumMap, len){
    var baseArr = [4, 5];
    for (var i in baseArr){
        if(len >= baseArr[i]*2 && len % baseArr[i] == 0){
            var seqNum = len / baseArr[i];
            if (isAircraftSequence(valNumMap, seqNum, i)){
                return true;
            }
        }
    }
    return false;
};

var isAircraftSequence = function(valNumMap, seqNum, flag){
    var threeValMap = {};
    var otherValArr = [];
    for (var i in valNumMap){
        if (valNumMap[i] >= 3){
            threeValMap[i] = 3;
            if (valNumMap[i] == 4){
                otherValArr.push(i);
            }
        }else{
            if (flag == 0){ //带1
                for (let j = 0; j < valNumMap[i]; ++j){
                    otherValArr.push(i);
                }
            }else{
                otherValArr.push(i);
            }
        }
    }
    var threeLength = utils.objectSize(threeValMap);
    console.log("ddk飞机带翅膀dk", seqNum, threeLength, otherValArr.length)
    if (threeLength == otherValArr.length){
        if (isContinuousValueInCardTab(threeValMap, 3, seqNum)){
            return true;
        }
    }
    return false;
}

exp.isKingBomb = function(tCard){
    for (var k in tCard){
        if(tCard[k] != 17 && tCard[k] != 18){ //17 小王 18 大王
            return false;
        }
    }
    return true;
}

var isContinuousValueInCardTab = function(valNumMap, numOfPoker, lenOfStraight){  // AA 22 33能连吗 
    var tValue = [];
    for(var val in valNumMap){
        if(valNumMap[val] == numOfPoker){
            tValue.push(Number(val));
        }else{
            return false;
        } 
    }
    var num = tValue.length;
    if(num >= lenOfStraight){
        for(var k = 0; k < num - 1; ++k){
            if (!(tValue[k] + 1 == tValue[k + 1])){
                return false;
            }
        }
        return true;
    }
    return false;
}

var isEqualValueInCardTab = function(valNumMap, equalNum){
    equalNum = equalNum || 1;
    var num = utils.objectSize(valNumMap);
    if (num == equalNum) {
        return true;
    }
    return false;
}

var getPokerValNumMap = function(tCard){
    if (tCard && typeof(tCard) == "object") {
        var tempTab = {};
        for (var k in tCard) {
            var v = tCard[k];
            if (!(tempTab[v])) {
                tempTab[v] = 1;
            }else{
                tempTab[v] = tempTab[v] + 1;
            }
        }
        return tempTab;
    }
    return {};
};

exp.isHaveKingBombOrFour2 = function(tCard){
    if (tCard && typeof(tCard) == "object") {
        var kingCount = 0;
        var countOf2 = 0;
        for (var i = 0, len = tCard.length; i < len; ++i) {
            if (tCard[i] == 117 || tCard[i] == 118){
                ++kingCount;
            }
            if (tCard[i] == 116 || tCard[i] == 216 || tCard[i] == 316 || tCard[i] == 416){
                ++countOf2;
            }
        }
        if (kingCount == 2 || countOf2 == 4){
            return true;
        }
        return false;
    }
    return false;
}

exp.getPokerValCardArrMap = function(tCard){
    if (tCard && typeof(tCard) == "object") {
        var tempTab = {};
        for (var i = 0, len = tCard.length; i < len; ++i) {
            var cardId = Number(tCard[i])
            var val = cardId % 100;
            if (!(tempTab[val])) {
                tempTab[val] = [cardId];
            }else{
                tempTab[val].push(cardId);
            }
        }
        return tempTab;
    }
    return {};
}