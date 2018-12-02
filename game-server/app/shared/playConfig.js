"use strict";
const niuRedis = require("../redis/redisCoinNiu");
const kengRedis = require("../redis/redisCoinKeng");
const gobangRedis = require("../redis/redisGobang");
const jinhuaRedis = require("../redis/redisCoinJinHua");
const ddzRedis = require("../redis/redisCoinDDZ");
const paoRedis = require("../redis/redisCoinPao");

const combatNiu = require("../parse/NiuCombatRecord");
const combatKeng = require("../parse/KengCombatRecord");
const combatGobang = require("../parse/GobangCombatRecord");
const combatZJH = require("../parse/JinCombatRecord");
const combatDDZ = require("../parse/DDZCombatRecord");
const combatPao = require("../parse/PaoCombatRecord");

const jinRoom = require("../game_logic/coin_jinhua/gameJinHuaRoom");
const jinPlayer = require("../game_logic/coin_jinhua/gameJinHuaPlayer");
const ddzRoom = require("../game_logic/coin_ddz/gameCoinRoom");
const ddzPlayer = require("../game_logic/coin_ddz/gameCoinPlayer");
const niuRoom = require("../game_logic/coin_douniu/gameNiuRoom");
const niuPlayer = require("../game_logic/coin_douniu/gameNiuPlayer");
const kengRoom = require("../game_logic/coin_keng/gameKengRoom");
const kengPlayer = require("../game_logic/coin_keng/gameKengPlayer");
const paoRoom = require("../game_logic/coin_pao/gamePaoRoom");
const paoPlayer = require("../game_logic/coin_pao/gamePaoPlayer");

exports.gamePlayToRoom = {
    [1]: niuRoom,
    [2]: ddzRoom,
    [3]: jinRoom,
    [4]: kengRoom,
    [5]: paoRoom
};
exports.gamePlayToPlayer = {
    [1]: niuPlayer,
    [2]: ddzPlayer,
    [3]: jinPlayer,
    [4]: kengPlayer,
    [5]: paoPlayer
};

exports.gamePlayToRule = {
    [1]: {
        gamePlay: 1,
        roomLaw: 1,
        roomType: 4,///1 匹配房， 2 大厅房， 3 私密房
        maxPersons: 6,
        GPSActive: 0,
        midJoinStat: 1,
        baseCoin: 0,
        autoFlopStat: 0
    },
    [2]: {
        gamePlay: 2,
        roomLaw: 2,//// 1  叫分 2 叫地主
        maxPersons: 3,
        GPSActive: 0,
        midJoinStat: 1,
        baseCoin: 0,
        roomType: 4,///1 匹配房， 2 大厅房， 3 私密房
        rulePlay: {
            bombNum: 3,///////炸弹数量  3炸  4炸 5炸
            bijiao: 0, ///////1 双王或4个2必叫   0 不是
            budai345: 0,//////1 不带345  0 带345
        }
    },
    [3]: {
        gamePlay: 3,
        roomLaw: 1,//// 1  同花大 2 顺子大
        maxPersons: 5,
        GPSActive: 0,
        midJoinStat: 1,
        baseCoin: 0,
        roomType: 4,///1 匹配房， 2 大厅房， 3 私密房
        rulePlay: {
            bimen: 3,           //1 无必闷 2 闷一圈 3 闷三圈
            chibao: 2,          //1 235不吃豹子 2 235吃所有豹子 3 235吃AAA豹子
            xifen: 1,           //0 不带喜分  1 带喜分
            zhanshipai: 0,      //0 不公布底牌 1 公布底牌
        }
    },
    [4]:{
        gamePlay: 4,
        roomLaw: 1,//// 1  半坑9， 2 半坑10， 3 全坑 
        maxPersons: 5,
        GPSActive: 0,
        midJoinStat: 1,
        baseCoin: 0,
        roomType: 4,///1 匹配房， 2 大厅房， 3 私密房
        rulePlay: {
            betPlay: 1,     //1 不可减少， 2 随意下注
            gongzhang: 2,   //1 公张随豹， 2 公张随点
            daiwang: 1,     //0 不带王， 1 带王14，  2 带王16
            zhuaApao: 1,    //抓A必炮，0 不炮
            daiti: 1,       //1 带踢， 0 不带踢
            languobei: 0,   //烂锅翻倍，0 不翻倍
            sitiao60: 0,    //四条100分， 1  四条60分
            bipai: 1,       //1 比点， 2 比豹
        }
    },
    [5]: {

    }
};

exports.gamePlayToSetGetCombatGainFunc = {
    [1]: [niuRedis.getNiuCombatGain, niuRedis.setNiuCombatGain],
    [2]: [ddzRedis.getDDZCombatGain, ddzRedis.setDDZCombatGain],
    [3]: [jinhuaRedis.getZJHCombatGain, jinhuaRedis.setZJHCombatGain],
    [4]: [kengRedis.getKengCombatGain, kengRedis.setKengCombatGain],
    [5]: [paoRedis.getPaoCombatGain, paoRedis.setPaoCombatGain],
    [50]: [gobangRedis.getGobangCombatGain, gobangRedis.setGobangCombatGain]
};

exports.gamePlayToRedisMongoArr = {
    [1]: [niuRedis, combatNiu],
    [2]: [ddzRedis, combatDDZ],
    [3]: [jinhuaRedis, combatZJH],
    [4]: [kengRedis, combatKeng],
    [5]: [paoRedis, combatPao],
    [50]: [gobangRedis, combatGobang]
};