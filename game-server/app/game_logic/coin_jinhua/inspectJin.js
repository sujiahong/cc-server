"use_strict";
const TAG = "inspect.js";
const constant = require("../../shared/constant");

var exp = module.exports;

exp.inspectCardType = function (cards, typeData){
    var type = typeData.none;
    var suitAndValArr = getSuitAndValue(cards);
    var suitArr = suitAndValArr[0], valArr = suitAndValArr[1];
    if (isStraight(valArr)) {
        if (isFlush(suitArr)) {
            type = typeData.tonghuashun;
        } else {
            type = typeData.shunzi;
        }
    }else if(isFlush(suitArr)){
        type = typeData.tonghua;
    }else if (isBaozi(valArr)) {
        type = typeData.baozi;
    }else if (isDouble(valArr)) {
        type = typeData.duizi;
    }
    return {type, valArr};
}

var getSuitAndValue = function(cards){
    cards.sort(function(a, b){return Number(a)%100 - Number(b)%100});
    var suitArr = [];
    var valArr = [];
    for (var i = 0, len = cards.length; i < len; ++i){
        var cardId = cards[i];
        suitArr[i] = Math.floor(Number(cardId) / 100);
        valArr[i] = Number(cardId) % 100;
    }
    return [suitArr, valArr];
}

var isDouble = function (valArr) {
    return (valArr[0] == valArr[1]) || (valArr[0] == valArr[2]) || (valArr[1] == valArr[2]);
};

var isBaozi = function(valArr){
    return (valArr[0] == valArr[1]) && (valArr[0] == valArr[2]) && (valArr[1] == valArr[2]);
}

var isFlush = function(suitArr) {
    return (suitArr[0] == suitArr[1]) && (suitArr[0] == suitArr[2]) && (suitArr[1] == suitArr[2]);
};

var isStraight = function(valArr) {
    if (valArr[0] == 2 && valArr[1] == 3 && valArr[2] == 14){
        return true;
    }
    var len = valArr.length;
    for(var k = 0; k < len - 1; ++k){
        if (valArr[k] + 1 != valArr[k + 1]){
            return false;
        }
    }
    return true;
};

exp.compareNotEat = function(cardTypeData, type, comparedType, valArr, comparedValArr){
    if (type > comparedType){
        return 1;
    }else if(type < comparedType){
        return -1;
    }else{///////////牌型一样
        if (type == 1){
            var secondVal = valArr[1];
            var comparedSecondVal = comparedValArr[1];
            if (secondVal > comparedSecondVal){
                return 1;
            }else if (secondVal < comparedSecondVal){
                return -1;
            }else{
                var firstVal = valArr[0];
                var singleVal = (firstVal == secondVal) ? valArr[2] : firstVal;
                var comparedFirstVal = comparedValArr[0];
                var comparedSingleVal = (comparedFirstVal == comparedSecondVal) ? comparedValArr[2] : comparedFirstVal;
                if (singleVal > comparedSingleVal){
                    return 1;
                }else{
                    return -1;
                }
            }
        }else if(type == cardTypeData.shunzi || type == cardTypeData.tonghuashun){
            var isA23 = valArr[0] == 2 && valArr[1] == 3 && valArr[2] == 14;
            var isComparedA23 = comparedValArr[0] == 2 && comparedValArr[1] == 3 && comparedValArr[2] == 14;
            if (isA23){
                return -1;
            }else if (isComparedA23){
                return 1;
            }else{
                return compareTwoValArr(valArr, comparedValArr);
            }
        }else{
            return compareTwoValArr(valArr, comparedValArr);
        }
    }
}

var compareTwoValArr = function(valArr, comparedValArr){
    if (valArr[2] > comparedValArr[2]){
        return 1;
    }else if (valArr[2] < comparedValArr[2]){
        return -1;
    }else{
        if (valArr[1] > comparedValArr[1]){
            return 1;
        }else if (valArr[1] < comparedValArr[1]){
            return -1;
        }else{
            if (valArr[0] > comparedValArr[0]){
                return 1;
            }else{
                return -1;
            }
        }
    }
}