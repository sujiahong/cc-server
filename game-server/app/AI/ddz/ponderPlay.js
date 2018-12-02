"use strict";
const TAG = "ponderPlay.js";
const inspect = require("../../game_logic/coin_ddz/inspectDDZ");
const errcode = require("../../shared/errcode");
const constant = require("../../shared/constant");

var exp = module.exports;

exp.getLevelOneThinkCards = function(room, userId){
    var player = room.getPlayerByUId(userId);
    var valArrMap = inspect.getPokerValCardArrMap(player.cardInHand);
    var cards = getSingleCombinationCard(valArrMap, constant.DDZ_CARD_TYPE.singleCard);
    console.log(TAG, "\\\\\\\\\\\\\\\\", cards)
    return cards;
}

var getSingleCombinationCard = function(valArrMap, cardType){
    var arr;
    if (cardType == constant.DDZ_CARD_TYPE.singleCard){
        arr = getAllSingleCard(valArrMap);
        if (arr.length == 0){
            arr = getAllPairCard(valArrMap);
        }
        if (arr.length == 0){
            arr = getAllThreeCard(valArrMap);
        }
        if (arr.length == 0){
            arr = getAllBomb(valArrMap);
        }
        return arr[0];
    }else if (cardType == constant.DDZ_CARD_TYPE.pairCard){
        arr = getAllPairCard(valArrMap);
        if (arr.length == 0){
            arr = getAllThreeCard(valArrMap);
        }
        if (arr.length == 0){
            arr = getAllBomb(valArrMap);
        }
        return arr[0];
    }else if (cardType == constant.DDZ_CARD_TYPE.threeCard){
        arr = getAllThreeCard(valArrMap);
        if (arr.length == 0){
            arr = getAllBomb(valArrMap);
        }
        return arr[0];
    }
}

var getAllSingleCard = function(valArrMap){
    var tempArr = [];
    for(var val in valArrMap){
        if (valArrMap[val].length == 1){
            tempArr.push(valArrMap[val]);
        }
    }
    return tempArr;
}

var getAllPairCard = function(valArrMap){
    var tempArr = [];
    for(var val in valArrMap){
        if (valArrMap[val].length == 2){
            tempArr.push(valArrMap[val]);
        }
    }
    return tempArr;
}

var getAllThreeCard = function(valArrMap){
    var tempArr = [];
    for(var val in valArrMap){
        if (valArrMap[val].length == 3){
            tempArr.push(valArrMap[val]);
        }
    }
    return tempArr;
}

var getAllBomb= function(valArrMap){
    var tempArr = [];
    for(var val in valArrMap){
        if (valArrMap[val].length == 4){
            tempArr.push(valArrMap[val]);
        }
    }
    return tempArr;
}


var getMultiCombinationCard = function(valArrMap, cardType){
    if (cardType == constant.DDZ_CARD_TYPE.threeWithOne){
        var singleArr = getAllSingleCard(valArrMap);
        var threeArr = getAllThreeCard(valArrMap);
        return [threeArr[0], singleArr[0]];
    }else if (cardType == constant.DDZ_CARD_TYPE.threeWithPair){
        var pairArr = getAllPairCard(valArrMap);
        var threeArr = getAllThreeCard(valArrMap);
        return [threeArr[0], pairArr[0]];
    }else if (cardType == constant.DDZ_CARD_TYPE.consecutivePair){
        var pairArr = getAllPairCard(valArrMap);
    }else if (cardType == constant.DDZ_CARD_TYPE.threeSequence){
        var threeArr = getAllThreeCard(valArrMap);
    }else if (cardType == constant.DDZ_CARD_TYPE.singleSequence){
        var singleArr = getAllSingleCard(valArrMap);
    }else if (cardType == constant.DDZ_CARD_TYPE.kingBomb){
        var kingBombArr = getKingBomb();
        return kingBombArr;
    }
}

var getKingBomb = function(valArrMap){
    var tempArr = [];
    for(var val in valArrMap){
        var arr = valArrMap[val];
        val = Number(val);
        if (arr.length == 1 && (val == 17 || val == 18)){
            tempArr.push(valArrMap[val][0]);
        }
    }
    return tempArr;
}