const TAG = "pushMessage.js";
const constant = require("../../shared/constant");
const errcode = require("../../shared/errcode");
const pomelo = require("pomelo");
const channelService = pomelo.app.get("channelService");

var exp = module.exports;

exp.pushTrusteeship = function(room, userId, stat, next){
    try{
        var pushData = {route: "onTrusteeship", userId: userId, trusteeStat: stat};
		var uidsidArr = [];
		var players = room.players;
        for (var uid in players){
            uidsidArr.push({uid: uid, sid: players[uid].frontServerId});
		}
		var witnessPlayers = room.witnessPlayers;
        for (var uid in witnessPlayers){
            uidsidArr.push({uid: uid, sid: witnessPlayers[uid].frontServerId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushTrusteeship:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushTrusteeship: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushTrusteeship: error", e);
    }
}

exp.pushRobLandlord = function(room, userId, score, next){
    try{
		var pushData = {route: "onRob", userId: userId, robScore: score};
		pushData.operateId = room.operateId;
		pushData.dealerId = room.dealerId;
		var uidsidArr = [];
		var players = room.players;
        for (var uid in players){
            uidsidArr.push({uid: uid, sid: players[uid].frontServerId});
		}
		var witnessPlayers = room.witnessPlayers;
        for (var uid in witnessPlayers){
            uidsidArr.push({uid: uid, sid: witnessPlayers[uid].frontServerId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushRobLandlord:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushRobLandlord: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushRobLandlord: error", e);
    }
}

exp.pushPlayCard = function(room, userId, cards, next){
    try{
		var pushData = {route: "onPlayCard", userId: userId, cards: cards};
		pushData.operateId = room.operateId;
		var uidsidArr = [];
		var players = room.players;
        for (var uid in players){
            uidsidArr.push({uid: uid, sid: players[uid].frontServerId});
		}
		var witnessPlayers = room.witnessPlayers;
        for (var uid in witnessPlayers){
            uidsidArr.push({uid: uid, sid: witnessPlayers[uid].frontServerId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushPlayCard:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushPlayCard: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushPlayCard: error", e);
    }
}

exp.pushResult = function(room, result, next){
    try{
        var pushData = {route: "onResult", result: result};
        var uidsidArr = [];
        var players = room.players;
        for (var uid in players){
            uidsidArr.push({uid: uid, sid: players[uid].frontServerId});
        }
        var witnessPlayers = room.witnessPlayers;
        for (var uid in witnessPlayers){
            uidsidArr.push({uid: uid, sid: witnessPlayers[uid].frontServerId});
        }
        if (uidsidArr.length > 0){
            channelService.pushMessageByUids(pushData, uidsidArr, function(err){
                console.warn(TAG, "pushResult:  channelService.pushMessageByUids: ", err);
                next(null, {code: errcode.OK});
            });
        }else{
            console.warn(TAG, "pushResult: 没有其他玩家可以推送消息");
            next(null, {code: errcode.OK});
        }
    }catch(e){
        console.error(TAG, "pushResult:  error: ", e);
	}
}
