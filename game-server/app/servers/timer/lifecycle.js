
module.exports.afterStartAll = function(app) {
    console.log(app.getServerType(), "---- do some operations after all applications start up");
    fixedTimeRefreshRanking();
    clearRedis();
    require("../../http/start.js");
    generateSystemRoomList();
};

var fixedTimeRefreshRanking = function(){
    const errcode = require("../../shared/errcode");
    const userRecord = require("../../parse/UserRecord");
    const redis = require("../../redis/redisDb");
    setInterval(function(){
        var date = new Date();
        var h = date.getHours();
        var m = date.getMinutes();
        console.log("timer timer hour:", h, "minutes: ", m, "second: ", date.getSeconds());
        if (h == 0 && m == 0){
            redis.clearUserIdToShareTime();
            var rank = function(){
                userRecord.generateCoinRankingList(function(err, retArr){
                    if (err){
                        return setTimeout(rank, 5000);
                    }
                    var arr = [];
                    for (var i = 0, len = retArr.length; i < len; ++i){
                        var ret = retArr[i];
                        arr.push({
                            userId: ret.id.toString(),
                            nickname: ret.get("nickname"),
                            userNo: ret.get("userNo"),
                            comment: ret.get("comment"),
                            userIcon: ret.get("userIconUrl"),
                            coinNum: ret.get("coinNum")
                        });
                    }
                    console.log("resort coin ranking ", retArr.length)
                    var str = JSON.stringify(arr);
                    redis.setCoinRankingList(str);
                });
            }
            rank();
        }
        saveOnlineUserAmount(redis);
    }, 60000);
}

var saveOnlineUserAmount = function(redis){
    const onlineRecord = require("../../parse/OnlineRecord");
    redis.getCurrentUserAmount((err, num)=>{
        console.log("timer  saveOnlineUserAmount", err, num);
        if (err){
            return;
        }
        onlineRecord.addRecord(num);
    });
}

var clearRedis = function(){
    const redis = require("../../redis/redisDb");
    redis.delUserIdServerIdKey();
    redis.clearRoomIdToPlay();
}

var generateSystemRoomList = function(){
    const errcode = require("../../shared/errcode");
    const constant = require("../../shared/constant");
    const redis = require("../../redis/redisDb");
    const util = require("../../util/utils");
    const pomelo = require("pomelo");
    const async = require("async");
    const rpc = pomelo.app.rpc;
    var roomList = constant.STSTEM_ROOM_LIST;
    var generate = function(idx){
        if (idx < roomList.length){
            var roomData = roomList[idx];
            util.genRoomUniqueId(redis.existRoomId, function(err, roomId){
                if (err) {
                    return generate(idx);
                }
                if (roomData.play == constant.GAME_PLAY.tian_da_keng){
                    rpc.game_keng.kengRemote.timerToCreateRoom({roomId: roomId}, roomId, roomData.baseCoin, (err, data)=>{
                        if (err){
                            return generate(idx);
                        }
                        generate(++idx)
                    });
                }else if (roomData.play == constant.GAME_PLAY.niu_niu){
                    rpc.game_niu.niuRemote.timerToCreateRoom({roomId: roomId}, roomId, roomData.baseCoin, (err, data)=>{
                        if (err){
                            return generate(idx);
                        }
                        generate(++idx)
                    });
                }else if (roomData.play == constant.GAME_PLAY.zha_jin_hua){
                    rpc.game_jin.jinRemote.timerToCreateRoom({roomId: roomId}, roomId, roomData.baseCoin, (err, data)=>{
                        if (err){
                            return generate(idx);
                        }
                        generate(++idx)
                    });
                }else if (roomData.play == constant.GAME_PLAY.dou_di_zhu){
                    rpc.game_ddz.ddzRemote.timerToCreateRoom({roomId: roomId}, roomId, roomData.baseCoin, (err, data)=>{
                        if (err){
                            return generate(idx);
                        }
                        generate(++idx)
                    });
                }
            });
        }
    }
    setTimeout(function(){
        generate(0);
    }, 2000);
}