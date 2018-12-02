"use_strict";
const TAG = "inspect.js";
const constant = require("../../shared/constant");
const NIUTYPE = constant.NIU_TYPE;
const NIU_WUHUA_TYPE = constant.NIU_WUHUA_TYPE;
const NIU_JINGDIAN_TYPE = constant.NIU_JINGDIAN_TYPE;

var exp = module.exports;

////bankerNiu,,,, otherCards === [402, 303, 101, 211, 413]
exp.compareCards = function(bankerNiu, otherNiu){
    console.log(bankerNiu, "=--==-=-=  ", otherNiu);
    var ret = {win: 0, type: bankerNiu.type};
    if (bankerNiu.type > otherNiu.type){
        ret.win = 1;
    }else if(bankerNiu.type < otherNiu.type){
        ret.win = -1;
        ret.type = otherNiu.type;
    }else{
        var bankerValArr = bankerNiu.valArr;
        var otherValArr = otherNiu.valArr;
        var idx = 4;
        while (idx >= 0){
            if (bankerValArr[idx] > otherValArr[idx]){
                ret.win = 1; break;
            }else if(bankerValArr[idx] < otherValArr[idx]){
                ret.win = -1; 
                ret.type = otherNiu.type; break;
            }else{
                --idx;
            }
        }
        if (ret.win == 0){
            ret.win = 1;////////庄家赢
        }
    }
    return ret;
}

////cards === [402, 303, 101, 211, 413]
////return === {type: 1, niu: [], aux: [], valArr: []}
exp.getWuHuaNiuCards = function(cards){
    var ret = {};
    var suitAndValArr = getArrOfSuitAndValeAndSpadeNine(cards);
    var suitArr = suitAndValArr[0], valArr = suitAndValArr[1];
    ret.valArr = valArr;
    var valNumObj = getValNumObj(valArr);
    var sum = getValSum(valArr);
    if(isShunziNiu(valArr)){
        if (isTongHuaNiu(suitArr)){
            ret.type = NIU_WUHUA_TYPE.niu_tonghuashun;
        }else{
            ret.type = NIU_WUHUA_TYPE.niu_shunzi;
        }
    }else if (isZhaDanNiu(valNumObj)){
        ret.type = NIU_WUHUA_TYPE.niu_zhadan;
    }else if(isSiShiNiu(sum)){
        ret.type = NIU_WUHUA_TYPE.niu_sishi;
    }else if (isShixiaoNiu(sum)){
        ret.type = NIU_WUHUA_TYPE.niu_shixiao;
    }else{
        var arr = getArrOfJinAndYinPaiCountAndOneSum(valNumObj);
        if (arr[0] == 1 && arr[1] == 1){
            ret.type = NIU_WUHUA_TYPE.niu_hulu;
        }else if (arr[0] == 1){
            ret.type = getJinPaiNiuType(arr[2]);
            var niuRet = getNiuTypeData(cards, valArr, getWuHuaNiuType);
            if (niuRet.type > ret.type){
                ret = niuRet;
            }
        }else{
            ret = getNiuTypeData(cards, valArr, getWuHuaNiuType);
            if (ret.type == NIU_WUHUA_TYPE.niu_0 && suitAndValArr[2]){
                ret.type = NIU_WUHUA_TYPE.cunzhang;
            }
        }
    }
    return ret;
}

var getArrOfSuitAndValeAndSpadeNine = function(cards){
    cards.sort(function(a, b){return Number(a)%100 - Number(b)%100});
    var suitArr = [];
    var valArr = [];
    var isSpadeNine = false;
    for (var i = 0, len = cards.length; i < len; ++i){
        var cardId = cards[i];
        suitArr[i] = Math.floor(Number(cardId) / 100);;
        valArr[i] = Number(cardId) % 100;
        if (cardId == 409){/////黑桃9
            isSpadeNine = true;
        }
    }
    return [suitArr, valArr, isSpadeNine];
}

var getValNumObj = function(valArr){
    var valNumObj = {};
    for (var i = 0, len = valArr.length; i < len; ++i){
        var val = valArr[i];
        if (valNumObj[val]){
            valNumObj[val]++;
        }else{
            valNumObj[val] = 1;
        }
    }
    return valNumObj;
}

var getValSum = function(valArr){
    var sum = 0;
    for (var i = 0, len = valArr.length; i < len; ++i){
        sum += valArr[i];
    }
    return sum;
}

var isShixiaoNiu = function(sum){
    if (sum <= 10){
        return true;
    }
    return false
}

var isSiShiNiu = function(sum){
    if (sum >= 40){
        return true;
    }
    return false
}

var getArrOfJinAndYinPaiCountAndOneSum = function(valNumObj){
    var jinCount = 0;
    var yinCount = 0;
    var sum = 0;
    for(var v in valNumObj){
        var num = valNumObj[v];
        if (num == 3){
            ++jinCount;
        }else if (num == 2){
            ++yinCount;
        }else if (num == 1){
            sum += parseInt(v);
        }
    }
    return [jinCount, yinCount, sum];
}

var getJinPaiNiuType = function(sum){
    var val = sum % 10;
    switch(val){
        case 0:
            return NIU_WUHUA_TYPE.niu_jin10;
        case 1:
            return NIU_WUHUA_TYPE.niu_jin1;
        case 2:
            return NIU_WUHUA_TYPE.niu_jin2;
        case 3:
            return NIU_WUHUA_TYPE.niu_jin3;
        case 4:
            return NIU_WUHUA_TYPE.niu_jin4;
        case 5:
            return NIU_WUHUA_TYPE.niu_jin5;
        case 6:
            return NIU_WUHUA_TYPE.niu_jin6;
        case 7:
            return NIU_WUHUA_TYPE.niu_jin7;
        case 8:
            return NIU_WUHUA_TYPE.niu_jin8;
        case 9:
            return NIU_WUHUA_TYPE.niu_jin9;
    }
}

var getNiuTypeData = function(cards, valArr, niuTypeFunc){
    var len = valArr.length;
    for(var i = 0; i < 3; ++i){
        var val1 = valArr[i];
        if (val1 > 10){
            val1 = 10;
        }
        for (var ii = i + 1; ii < len; ++ii){
            var val2 = valArr[ii];
            if (val2 > 10){
                val2 = 10;
            }
            for (var iii = ii + 1; iii < len; ++iii){
                var val3 = valArr[iii];
                if (val3 > 10){
                    val3 = 10;
                }
                console.log(i, ii, iii);
                if ((val1 + val2 + val3) % 10 === 0){
                    var arr = getArrOfAuxValArrAndSum(cards, valArr, [i, ii, iii]);
                    return {type: niuTypeFunc(arr[1]), valArr: valArr, niu: [cards[i], cards[ii], cards[iii]], aux: arr[0]};
                }
            }
        }
    }
    return {type: NIU_WUHUA_TYPE.niu_0, valArr: valArr};
}

var getArrOfAuxValArrAndSum = function(cards, valArr, niuIdxArr){
    var auxValArr = [];
    var sum = 0;
    var val = 0;
    for (var i = 0, len = valArr.length; i < len; ++i){
        if (i != niuIdxArr[0] && i != niuIdxArr[1] && i != niuIdxArr[2]){
            auxValArr.push(cards[i]);
            val = valArr[i];
            if (val > 10){
                val = 10;
            }
            sum += val;
        }
    }
    return [auxValArr, sum];
}

var getWuHuaNiuType = function(sum){
    var val = sum % 10;
    switch(val){
        case 0:
            return NIU_WUHUA_TYPE.niu_10;
        case 1:
            return NIU_WUHUA_TYPE.niu_1;
        case 2:
            return NIU_WUHUA_TYPE.niu_2;
        case 3:
            return NIU_WUHUA_TYPE.niu_3;
        case 4:
            return NIU_WUHUA_TYPE.niu_4;
        case 5:
            return NIU_WUHUA_TYPE.niu_5;
        case 6:
            return NIU_WUHUA_TYPE.niu_6;
        case 7:
            return NIU_WUHUA_TYPE.niu_7;
        case 8:
            return NIU_WUHUA_TYPE.niu_8;
        case 9:
            return NIU_WUHUA_TYPE.niu_9;
    }
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////


exp.getJingDianNiuCards = function(cards){
    var ret = {};
    var suitAndValArr = getSuitAndValue(cards);
    var suitArr = suitAndValArr[0], valArr = suitAndValArr[1];
    ret.valArr = valArr;
    var valNumObj = getValNumObj(valArr);
    if(isShunziNiu(valArr)){
        if (isTongHuaNiu(suitArr)){
            ret.type = NIU_JINGDIAN_TYPE.niu_tonghuashun;
        }else{
            ret.type = NIU_JINGDIAN_TYPE.niu_shunzi;
        }
    }else if(isWuXiaoNiu(valArr)){
        ret.type = NIU_JINGDIAN_TYPE.niu_wuxiao;
    }else if(isZhaDanNiu(valNumObj)){
        ret.type = NIU_JINGDIAN_TYPE.niu_zhadan;
    }else if(isHuluNiu(valNumObj)){
        ret.type = NIU_JINGDIAN_TYPE.niu_hulu;
    }else{
        var arr = getArrOfHuaAndTenCount(valArr);
        if (arr[0] == 5){
            ret.type = NIU_JINGDIAN_TYPE.niu_jin;
        }else if(arr[0] == 4 && arr[1] == 1){
            ret.type = NIU_JINGDIAN_TYPE.niu_yin;
        }else{
            ret = getNiuTypeData(cards, valArr, getJingDianNiuType);
        }
    }
    return ret;
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

var isZhaDanNiu = function(valNumObj){
    for(var v in valNumObj){
        if (valNumObj[v] == 4){
            return true;
        }
    }
    return false;
}

var isShunziNiu = function(valArr){
    var len = valArr.length;
    for(var k = 0; k < len - 1; ++k){
        if (valArr[k] + 1 != valArr[k + 1]){
            return false;
        }
    }
    return true;
}

var isTongHuaNiu = function(suitArr){
    var suit = suitArr[0];
    for (var i = 1, len = suitArr.length; i < len; ++i){
        if (suit != suitArr[i]){
            return false;
        }
    }
    return true;
}

var getArrOfHuaAndTenCount = function(valArr){
    var huaCount = 0;
    var tenCount = 0;
    for (var i = 0, len = valArr.length; i < len; ++i){
        if (valArr[i] > 10){
            ++huaCount;
        }else if(valArr[i] == 10){
            ++tenCount;
        }
    }
    return [huaCount, tenCount]
}

var isWuXiaoNiu = function(valArr){
    var sum = 0;
    for (var i = 0, len = valArr.length; i < len; ++i){
        sum += valArr[i];
        if (valArr[i] >= 5){
            return false;
        }
    }
    if (sum <= 10){
        return true;
    }
    return false;
}

var isHuluNiu = function(valNumObj){
    var isThree = false;
    var isTwo = false;
    for(var v in valNumObj){
        if (valNumObj[v] == 3){
            isThree = true;
        }else if (valNumObj[v] == 2){
            isTwo = true;
        }
    }
    if (isThree && isTwo){
        return true;
    }
    return false;
}

var getJingDianNiuType = function(sum){
    var val = sum % 10;
    switch(val){
        case 0:
            return NIU_JINGDIAN_TYPE.niu_10;
        case 1:
            return NIU_JINGDIAN_TYPE.niu_1;
        case 2:
            return NIU_JINGDIAN_TYPE.niu_2;
        case 3:
            return NIU_JINGDIAN_TYPE.niu_3;
        case 4:
            return NIU_JINGDIAN_TYPE.niu_4;
        case 5:
            return NIU_JINGDIAN_TYPE.niu_5;
        case 6:
            return NIU_JINGDIAN_TYPE.niu_6;
        case 7:
            return NIU_JINGDIAN_TYPE.niu_7;
        case 8:
            return NIU_JINGDIAN_TYPE.niu_8;
        case 9:
            return NIU_JINGDIAN_TYPE.niu_9;
    }
}