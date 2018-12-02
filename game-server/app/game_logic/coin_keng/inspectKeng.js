"use_strict";
const TAG = "inspect.js";
const constant = require("../../shared/constant");

var exp = module.exports;

exp.computeScore = function(room, userId, cards){
    var rulePlay = room.rulePlay;
    var valArr = [];
    var isHaveGongzhang = false;
    for (var i = 0, len = cards.length; i < len; ++i){
        var cardId = cards[i];
        valArr[i] = Number(cardId) % 100;
        if (rulePlay.gongzhang == 2 && room.isHaveGongzhang(userId)){
            isHaveGongzhang = true;
        }
    }
    var valNumObj = {};
    for (var i = 0, len = valArr.length; i < len; ++i){
        var val = valArr[i];
        if (valNumObj[val]){
            valNumObj[val]++;
        }else{
            valNumObj[val] = 1;
        }
    }
    var score = 0;
    var wangNum = 0;
    var santiaoNum = 0;
    for (var val in valNumObj){
        var value = Number(val);
        score += value * valNumObj[val];
        if (isHaveGongzhang && rulePlay.gongzhang == 2){
            if (value == room.gongzhang % 100){
                valNumObj[val] -= 1;
            }
        }
        if (valNumObj[val] == 4){
            if (room.roomLaw == constant.KENG_PLAY_TYPE.quan_keng && rulePlay.bipai == 2){
                score = constant.BAO_SCORE[4 + val];
            }else{
                if (rulePlay.sitiao60 == 1){
                    score += 60;
                }else{
                    score += 100;
                }
            }
        }else if (valNumObj[val] == 3){
            if (room.roomLaw == constant.KENG_PLAY_TYPE.quan_keng && rulePlay.bipai == 2){
                score = constant.BAO_SCORE[3 + val];
            }else{
                score += 30;
                santiaoNum = 1;
            }
        }else{
            if (rulePlay.daiwang == 1){
                if (Number(val) == 14 && valNumObj[val] == 2){
                    score += 30;
                    wangNum = 2;
                }
            }else if (rulePlay.daiwang == 2){
                if (Number(val) == 14 || Number(val) == 16){
                    ++wangNum;
                    if (wangNum == 2){
                        score += 30;
                    }
                }
            }
        }
    }
    if (santiaoNum == 1 && wangNum == 2){
        score += 10000;
    }
    return score;
}
