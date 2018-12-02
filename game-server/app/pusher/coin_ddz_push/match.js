"use_strict";
const TAG = "match.js";
const async = require("async");
const pusher = require("./push");
const ddzRedis = require('../../redis/redisCoinDDZ');
const redis = require("../../redis/redisDb");
const constant = require("../../shared/constant");
const Code = require("../../shared/errcode");
const coinRoom = require("../../game_logic/coin_ddz/gameCoinRoom");
const coinPlayer = require("../../game_logic/coin_ddz/gameCoinPlayer");
const userRecord = require("../../parse/UserRecord");

var exp = module.exports;

exp.match = function(self, areaIndex, callback){
    ddzRedis.getWaitingAreaMember(areaIndex, function(err, arr){
        if (err){
            return callback(Code.REDIS_DATABASE_ERR, err);
        }
        ddzRedis.getGamingAreaNum(areaIndex, function(err, num){
            if (err){
                return callback(Code.REDIS_DATABASE_ERR, err);
            }
            if (arr.length < 3){
                var pushData = {
                    type: 2,
                    coinDataArr: [{index: areaIndex, curGamingNum: num, curWaitingNum: arr.length}]
                };
                console.log(TAG, "正在匹配  等待数组arr:", arr);
                pusher.pushGamingAndWaiting(self, arr, pushData, function(){
                    callback(Code.MATCHING);
                });
            }else{ //匹配到了
                var startIdx = 0;
                var userId = arr[(startIdx) % arr.length]
                var nUserId = arr[(startIdx + 1) % arr.length];
                var nNUserId = arr[(startIdx + 2) % arr.length];
                if (nUserId == userId || userId == nNUserId || nUserId == nNUserId){
                    return callback(Code.SAME_USERID);
                }
                var playerArr = [userId, nUserId, nNUserId];
                console.log("@@@@@@@@@@@@@  匹配到了 ", playerArr);
                var room = new coinRoom();
                async.waterfall([
                function(cb){
                    room.init(areaIndex, playerArr, cb);
                }, function(cb){
                    initPlayerSession(self, room, cb);
                }, function(cb, sidArr){
                    initPLayer(room, sidArr, cb);
                }, function(cb, recordUsers){
                    moveWaitToGaming(room, function(errcode, data){
                        if (errcode){
                            return cb(errcode, data)
                        }
                        room.startOneRun();///开局
                        saveRoomIdToUserRecord(room, recordUsers, cb);
                    });
                }, function(cb){
                    pusher.pushJoinAndStartToClient(self, room, function(errcode, data){
                        if (errcode == Code.OK){
                            ddzRedis.setCoinRoomInfo(room.roomId, room.objectToJson());
                            callback(Code.OK);
                        }else{
                            cb(errcode, data);
                        }
                    });
                }], function(errcode, data){
                    console.log(TAG, "初始化房间失败   errcode:", errcode, "data :", data)
                    ddzRedis.exitMWaitingArea(areaIndex, playerArr, function(){});
                    ddzRedis.exitMGamingArea(areaIndex, playerArr, function(){});
                    callback(errcode);
                });
            }
        });
    });
}

var getIndexInArrByUid = function(arr, uid){
    for (var i in arr){
        if (arr[i] == uid){
            return i;
        }
    }
    return -1;
}

var moveWaitToGaming = function(room, callback){
    async.parallel([
    function(cb){
        redis.moveWaitingToGaming(room.areaIdx, room.userIdArr[0], function(err, reply){
            if (err){
                return cb(Code.REDIS_DATABASE_ERR, err);
            }
            cb(null, reply);
        });
    }, function(cb){
        redis.moveWaitingToGaming(room.areaIdx, room.userIdArr[1], function(err, reply){
            if (err){
                return cb(Code.REDIS_DATABASE_ERR, err);
            }
            cb(null, reply);
        });
    }, function(cb){
        redis.moveWaitingToGaming(room.areaIdx, room.userIdArr[2], function(err, reply){
            if (err){
                return cb(Code.REDIS_DATABASE_ERR, err);
            }
            cb(null, reply);
        });
    }, 
    ], function(errcode, resArr){
        if (errcode == Code.REDIS_DATABASE_ERR){
            return callback(errcode);
        }
        var success = 1;
        for (var i = 0; i < resArr.length; ++i){
            success &= resArr[i];
        }
        if (success == 1){
            callback();
        }else{
            callback(Code.REDIS_DATABASE_ERR);
        } 
    });

    self.enterRoomWithCoin(userDataArr, function (errcode, data) {
        if (errcode == Code.OK) {
            self.startOneRun();
            callback(Code.OK, data);
        } else {
            callback(errcode, data);
        }
    });
}


var initPLayer = function(room, sidArr, callback){
    var recordUsers = {};
    async.parallel([
    function(cb){
        var coinPLayer = new coinPlayer();
        coinPlayer.init(room.roomId, 1, room.userIdArr[0], room.areaIdx, sidArr[0], function(errcode, data){
            if (errcode != Code.OK){
                return cb(errcode, data);
            }
            recordUsers[room.userDataArr[0]] = data;
            cb(null, coinPlayer);
        });
    }, function(cb){
        var coinPLayer = new coinPlayer();
        coinPlayer.init(room.roomId, 2, room.userIdArr[1], room.areaIdx, sidArr[1], function(errcode, data){
            if (errcode != Code.OK){
                return cb(errcode, data);
            }
            recordUsers[room.userDataArr[1]] = data;
            cb(null, coinPlayer);
        });
    }, function(cb){
        var coinPLayer = new coinPlayer();
        coinPlayer.init(room.roomId, 3, room.userIdArr[2], room.areaIdx, sidArr[2], function(errcode, data){
            if (errcode != Code.OK){
                return cb(errcode, data);
            }
            recordUsers[room.userDataArr[2]] = data;
            cb(null, coinPlayer);
        });
    }
    ], function(errcode, resArr){
        if (errcode){
            return callback(errcode);
        }
        for (var i = 0, len = resArr.length; i < len; ++i){
            room.players[resArr[i].userId] = resArr[i];
        }
        callback(null, recordUsers);
    });
}

var initPlayerSession = function(self, room, callback){
    var sessionArr = [];
    redis.getMServerIdByUidArr(room.userIdArr, function(err, sidArr){
        if (err){
            return callback(Code.REDIS_DATABASE_ERR, err);
        }
        var uidArr = room.userIdArr;
        function _setUserSession(i){
            if (i < uidArr.length){
                self.backendSessionService.getByUid(sidArr[i], uidArr[i], function(err, sessions){
                    console.log(TAG, uidArr[i], sidArr[i], "###### _setUserSession %$%$%$%$%%", err, sessions)
                    if (err || !sessions){
                        return callback(Code.SESSION_NULL, err);
                    }
                    var osession = sessions[0];
                    sessionArr.push(osession);
                    _setUserSession(i + 1);
                });
            }else{
                for (var i in sessionArr){
                    sessionArr[i].set("roomId", room.roomId);
                    sessionArr[i].push("roomId");
                }
                callback(null, sidArr);
            }
        };
        _setUserSession(0);
    });
}

var saveRoomIdToUserRecord = function(room, recordUsers, callback){
    async.parallel([
    function(cb){
        userRecord.updateUserOptionsByObject(recordUsers[room.userIdArr[0]], {"roomId": room.roomId}, function(err, record){
            if (err){
                return cb(Code.MONGO_DATABASE_ERR, err);
            }
            cb();
        });
    }, function(cb){
        userRecord.updateUserOptionsByObject(recordUsers[room.userIdArr[1]], {"roomId": room.roomId}, function(err, record){
            if (err){
                return cb(Code.MONGO_DATABASE_ERR, err);
            }
            cb();
        });
    }, function(cb){
        userRecord.updateUserOptionsByObject(recordUsers[room.userIdArr[2]], {"roomId": room.roomId}, function(err, record){
            if (err){
                return cb(Code.MONGO_DATABASE_ERR, err);
            }
            cb();
        });
    }
    ], function(errcode){
        if (errcode){
            callback(errcode);
        }else{
            callback();
        }
    });
}